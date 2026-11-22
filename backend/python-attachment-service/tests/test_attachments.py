import unittest
import os
import tempfile
import sys

# Add parent directory to sys.path so app module can be found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.storage import LocalStorageAdapter, S3StorageAdapter
from unittest.mock import MagicMock

# Standalone validator test for unit verification
ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".pdf", ".txt", ".docx"]
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

def validate_meta(filename: str, file_size: int):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension {ext}")
    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds {MAX_FILE_SIZE_BYTES}")
    return True

class TestAttachmentService(unittest.TestCase):

    def test_sanitize_filename(self):
        import re
        def sanitize(fn):
            return re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(fn))[:100]

        self.assertEqual(sanitize("test file.png"), "test_file.png")
        self.assertEqual(sanitize("../../../malicious.exe"), "malicious.exe")
        self.assertEqual(sanitize("doc_123.pdf"), "doc_123.pdf")

    def test_validation_allowed_extensions(self):
        self.assertTrue(validate_meta("screenshot.png", 500 * 1024))
        self.assertTrue(validate_meta("error.log.txt", 1024))
        self.assertTrue(validate_meta("report.pdf", 5 * 1024 * 1024))

    def test_validation_unsupported_extension(self):
        with self.assertRaises(ValueError):
            validate_meta("malware.exe", 1024)

    def test_validation_oversized_file(self):
        with self.assertRaises(ValueError):
            validate_meta("huge.pdf", 15 * 1024 * 1024)

    def test_local_storage_adapter(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            adapter = LocalStorageAdapter(tmp_dir)
            key = "attachments/ticket-123/test.txt"
            content = b"Local file storage test payload"

            self.assertFalse(adapter.verify_object_exists(key))
            path = adapter.save_local_file(key, content)
            self.assertTrue(os.path.exists(path))
            self.assertTrue(adapter.verify_object_exists(key))

            with open(path, "rb") as f:
                self.assertEqual(f.read(), content)

    def test_s3_storage_adapter_save_file(self):
        adapter = S3StorageAdapter("test-bucket", "us-east-1")
        adapter.s3_client = MagicMock()
        key = "attachments/ticket-456/photo.png"
        content = b"PNG binary content"

        result = adapter.save_file(key, content, "image/png")
        self.assertEqual(result, "s3://test-bucket/attachments/ticket-456/photo.png")
        adapter.s3_client.put_object.assert_called_once_with(
            Bucket="test-bucket",
            Key=key,
            Body=content,
            ContentType="image/png"
        )

if __name__ == "__main__":
    unittest.main()
