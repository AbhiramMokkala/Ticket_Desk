import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class PresignUploadRequest(BaseModel):
    filename: str = Field(..., min_length=1, max_length=255)
    content_type: str
    file_size: int = Field(..., gt=0, le=10 * 1024 * 1024)

class PresignUploadResponse(BaseModel):
    attachment_id: uuid.UUID
    ticket_id: uuid.UUID
    object_key: str
    upload_url: str
    method: str = "PUT"
    headers: dict = {}

class CompleteUploadRequest(BaseModel):
    attachment_id: uuid.UUID

class AttachmentItemResponse(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    uploaded_by: uuid.UUID
    original_filename: str
    content_type: str
    file_size: int
    upload_status: str
    download_url: str
    created_at: datetime

class DownloadAttachmentResponse(BaseModel):
    attachment_id: uuid.UUID
    original_filename: str
    download_url: str
    is_direct_stream: bool = False

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[object] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
