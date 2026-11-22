import os
import uuid
from app.config import settings

class StorageAdapter:
    def generate_presigned_upload(self, object_key: str, content_type: str) -> dict:
        raise NotImplementedError

    def generate_download_url(self, object_key: str, original_filename: str) -> str:
        raise NotImplementedError

    def verify_object_exists(self, object_key: str) -> bool:
        raise NotImplementedError

    def save_file(self, object_key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        raise NotImplementedError

    def save_local_file(self, object_key: str, content: bytes) -> str:
        raise NotImplementedError

class LocalStorageAdapter(StorageAdapter):
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def _get_path(self, object_key: str) -> str:
        safe_key = object_key.replace("/", os.sep).replace("\\", os.sep)
        full_path = os.path.join(self.base_dir, safe_key)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        return full_path

    def generate_presigned_upload(self, object_key: str, content_type: str) -> dict:
        return {
            "upload_url": f"/api/attachments/local-upload?key={object_key}",
            "method": "POST",
            "headers": {"Content-Type": content_type}
        }

    def generate_download_url(self, object_key: str, original_filename: str) -> str:
        return f"/api/attachments/stream?key={object_key}&filename={original_filename}"

    def verify_object_exists(self, object_key: str) -> bool:
        path = self._get_path(object_key)
        return os.path.exists(path) and os.path.getsize(path) > 0

    def save_file(self, object_key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        path = self._get_path(object_key)
        with open(path, "wb") as f:
            f.write(content)
        return path

    def save_local_file(self, object_key: str, content: bytes) -> str:
        return self.save_file(object_key, content)

    def get_file_path(self, object_key: str) -> str:
        return self._get_path(object_key)

class S3StorageAdapter(StorageAdapter):
    def __init__(self, bucket_name: str, region_name: str):
        self.bucket_name = bucket_name
        self.region_name = region_name
        try:
            import boto3
            self.s3_client = boto3.client("s3", region_name=region_name)
        except ImportError:
            self.s3_client = None

    def generate_presigned_upload(self, object_key: str, content_type: str) -> dict:
        if not self.s3_client:
            raise RuntimeError("boto3 is required for S3 storage operations")
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key,
                    "ContentType": content_type
                },
                ExpiresIn=900
            )
            return {
                "upload_url": url,
                "method": "PUT",
                "headers": {"Content-Type": content_type}
            }
        except Exception as e:
            raise RuntimeError(f"Failed to generate S3 presigned upload URL: {e}")

    def generate_download_url(self, object_key: str, original_filename: str) -> str:
        if not self.s3_client:
            raise RuntimeError("boto3 is required for S3 storage operations")
        try:
            return self.s3_client.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": object_key,
                    "ResponseContentDisposition": f'attachment; filename="{original_filename}"'
                },
                ExpiresIn=900
            )
        except Exception as e:
            raise RuntimeError(f"Failed to generate S3 presigned download URL: {e}")

    def verify_object_exists(self, object_key: str) -> bool:
        if not self.s3_client:
            return False
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_key)
            return True
        except Exception:
            return False

    def save_file(self, object_key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        if not self.s3_client:
            raise RuntimeError("boto3 is required for S3 storage operations")
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=content,
                ContentType=content_type
            )
            return f"s3://{self.bucket_name}/{object_key}"
        except Exception as e:
            raise RuntimeError(f"Failed to upload file to S3: {e}")

    def save_local_file(self, object_key: str, content: bytes) -> str:
        return self.save_file(object_key, content)

def get_storage() -> StorageAdapter:
    if settings.STORAGE_PROVIDER.lower() == "s3":
        return S3StorageAdapter(settings.S3_BUCKET_NAME, settings.AWS_REGION)
    return LocalStorageAdapter(settings.LOCAL_STORAGE_DIR)
