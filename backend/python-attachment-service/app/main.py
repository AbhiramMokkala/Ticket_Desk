import os
import uuid
import re
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, init_db, TicketAttachment
from app.models import (
    PresignUploadRequest, PresignUploadResponse, CompleteUploadRequest,
    AttachmentItemResponse, DownloadAttachmentResponse, ApiResponse
)
from app.auth import AuthenticatedUser, get_current_user, verify_ticket_access
from app.storage import get_storage, LocalStorageAdapter

app = FastAPI(
    title="TicketDesk Attachment Service",
    description="Python FastAPI Microservice managing secure S3/Local ticket attachments",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "python-attachment-service",
        "framework": "Python 3.12 FastAPI",
        "storage_provider": settings.STORAGE_PROVIDER,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

def sanitize_filename(filename: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(filename))
    return cleaned[:100]

def validate_attachment_meta(filename: str, content_type: str, file_size: int):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB"
        )

@app.post("/api/tickets/{ticket_id}/attachments/presign", response_model=ApiResponse)
def request_presigned_upload(
    ticket_id: uuid.UUID,
    req: PresignUploadRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_ticket_access(ticket_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to attach files to this ticket")

    validate_attachment_meta(req.filename, req.content_type, req.file_size)

    safe_name = sanitize_filename(req.filename)
    attachment_id = uuid.uuid4()
    object_key = f"attachments/{ticket_id}/{attachment_id}_{safe_name}"

    storage = get_storage()
    upload_info = storage.generate_presigned_upload(object_key, req.content_type)

    attachment = TicketAttachment(
        id=attachment_id,
        ticket_id=ticket_id,
        uploaded_by=current_user.user_id,
        original_filename=safe_name,
        object_key=object_key,
        content_type=req.content_type,
        file_size=req.file_size,
        upload_status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(attachment)
    db.commit()

    response_data = PresignUploadResponse(
        attachment_id=attachment_id,
        ticket_id=ticket_id,
        object_key=object_key,
        upload_url=upload_info["upload_url"],
        method=upload_info["method"],
        headers=upload_info["headers"]
    )

    return ApiResponse(success=True, message="Presigned upload URL generated", data=response_data.model_dump())

@app.post("/api/tickets/{ticket_id}/attachments/complete", response_model=ApiResponse)
def complete_attachment_upload(
    ticket_id: uuid.UUID,
    req: CompleteUploadRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_ticket_access(ticket_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this ticket")

    attachment = db.query(TicketAttachment).filter(
        TicketAttachment.id == req.attachment_id,
        TicketAttachment.ticket_id == ticket_id
    ).first()

    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment record not found")

    storage = get_storage()
    if not storage.verify_object_exists(attachment.object_key):
        attachment.upload_status = "FAILED"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file could not be verified in storage")

    attachment.upload_status = "COMPLETED"
    db.commit()

    return ApiResponse(success=True, message="Attachment upload confirmed and completed", data={"attachment_id": str(attachment.id)})

@app.post("/api/tickets/{ticket_id}/attachments/upload", response_model=ApiResponse)
async def direct_upload_local(
    ticket_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Direct upload adapter for seamless local testing without external AWS storage."""
    if not verify_ticket_access(ticket_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to attach files to this ticket")

    content = await file.read()
    file_size = len(content)
    validate_attachment_meta(file.filename, file.content_type, file_size)

    safe_name = sanitize_filename(file.filename)
    attachment_id = uuid.uuid4()
    object_key = f"attachments/{ticket_id}/{attachment_id}_{safe_name}"

    storage = get_storage()
    storage.save_file(object_key, content, file.content_type or "application/octet-stream")

    attachment = TicketAttachment(
        id=attachment_id,
        ticket_id=ticket_id,
        uploaded_by=current_user.user_id,
        original_filename=safe_name,
        object_key=object_key,
        content_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        upload_status="COMPLETED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(attachment)
    db.commit()

    return ApiResponse(
        success=True,
        message="Attachment uploaded successfully",
        data={
            "id": str(attachment.id),
            "original_filename": attachment.original_filename,
            "file_size": attachment.file_size
        }
    )

@app.get("/api/tickets/{ticket_id}/attachments", response_model=ApiResponse)
def list_attachments(
    ticket_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_ticket_access(ticket_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view attachments for this ticket")

    records = db.query(TicketAttachment).filter(
        TicketAttachment.ticket_id == ticket_id,
        TicketAttachment.upload_status == "COMPLETED"
    ).order_by(TicketAttachment.created_at.desc()).all()

    storage = get_storage()
    results = []
    for r in records:
        download_url = storage.generate_download_url(r.object_key, r.original_filename)
        results.append({
            "id": str(r.id),
            "ticket_id": str(r.ticket_id),
            "uploaded_by": str(r.uploaded_by),
            "original_filename": r.original_filename,
            "content_type": r.content_type,
            "file_size": r.file_size,
            "upload_status": r.upload_status,
            "download_url": f"/api/attachments/{r.id}/download",
            "created_at": r.created_at.isoformat()
        })

    return ApiResponse(success=True, message="Attachments retrieved", data=results)

@app.get("/api/attachments/{attachment_id}/download")
def download_attachment(
    attachment_id: uuid.UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attachment = db.query(TicketAttachment).filter(TicketAttachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    if not verify_ticket_access(attachment.ticket_id, current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to download this attachment")

    storage = get_storage()
    if isinstance(storage, LocalStorageAdapter):
        file_path = storage.get_file_path(attachment.object_key)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File content not found on disk")
        return FileResponse(
            path=file_path,
            filename=attachment.original_filename,
            media_type=attachment.content_type
        )
    else:
        presigned_url = storage.generate_download_url(attachment.object_key, attachment.original_filename)
        return RedirectResponse(url=presigned_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

@app.get("/api/attachments/stream")
def stream_local_file(key: str = Query(...), filename: str = Query(...)):
    storage = get_storage()
    if isinstance(storage, LocalStorageAdapter):
        file_path = storage.get_file_path(key)
        if os.path.exists(file_path):
            return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
