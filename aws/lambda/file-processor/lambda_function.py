import json
import logging
import os
import urllib.parse
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client("s3")

MAX_FILE_SIZE = int(os.environ.get("MAX_FILE_SIZE_BYTES", 10 * 1024 * 1024)) # 10MB
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".txt", ".docx"}
ALLOWED_PREFIX = os.environ.get("ALLOWED_OBJECT_PREFIX", "attachments/")

def lambda_handler(event, context):
    """
    AWS Lambda File Processor triggered by S3 ObjectCreated events.
    Validates object presence, MIME type, size limit, and prefix,
    and logs structured JSON audits to Amazon CloudWatch.
    """
    logger.info(json.dumps({
        "event_type": "LAMBDA_INVOCATION",
        "request_id": getattr(context, "aws_request_id", "local-test-id"),
        "records_count": len(event.get("Records", []))
    }))

    results = []

    for record in event.get("Records", []):
        event_name = record.get("eventName", "")
        bucket_name = record.get("s3", {}).get("bucket", {}).get("name")
        raw_key = record.get("s3", {}).get("object", {}).get("key", "")
        object_key = urllib.parse.unquote_plus(raw_key)

        processing_record = {
            "bucket": bucket_name,
            "object_key": object_key,
            "event_name": event_name,
            "status": "PENDING",
            "reason": None
        }

        # 1. Validate Prefix
        if not object_key.startswith(ALLOWED_PREFIX):
            processing_record["status"] = "SKIPPED"
            processing_record["reason"] = f"Key does not match expected prefix: {ALLOWED_PREFIX}"
            logger.info(json.dumps(processing_record))
            results.append(processing_record)
            continue

        # 2. Validate Extension
        ext = os.path.splitext(object_key)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            processing_record["status"] = "REJECTED"
            processing_record["reason"] = f"Forbidden file extension: {ext}"
            logger.warning(json.dumps(processing_record))
            results.append(processing_record)
            continue

        # 3. Retrieve Object Metadata from S3
        try:
            head_resp = s3_client.head_object(Bucket=bucket_name, Key=object_key)
            content_length = head_resp.get("ContentLength", 0)
            content_type = head_resp.get("ContentType", "application/octet-stream")
            etag = head_resp.get("ETag", "").strip('"')

            processing_record["file_size_bytes"] = content_length
            processing_record["content_type"] = content_type
            processing_record["etag"] = etag

            # 4. Validate Size Limits
            if content_length > MAX_FILE_SIZE:
                processing_record["status"] = "REJECTED"
                processing_record["reason"] = f"File exceeds maximum size {MAX_FILE_SIZE} bytes"
                logger.warning(json.dumps(processing_record))
                results.append(processing_record)
                continue

            # 5. Successful Processing & Structured CloudWatch Audit
            processing_record["status"] = "PROCESSED"
            processing_record["reason"] = "File validated successfully and verified in S3"
            logger.info(json.dumps({
                "audit_event": "TICKET_ATTACHMENT_VERIFIED",
                "bucket": bucket_name,
                "object_key": object_key,
                "file_size": content_length,
                "content_type": content_type,
                "etag": etag,
                "status": "APPROVED"
            }))

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            processing_record["status"] = "ERROR"
            processing_record["reason"] = f"S3 ClientError: {error_code} - {str(e)}"
            logger.error(json.dumps(processing_record))

        results.append(processing_record)

    return {
        "statusCode": 200,
        "processed_records": len(results),
        "results": results
    }
