import json
import unittest
from unittest.mock import MagicMock, patch
from lambda_function import lambda_handler

class TestLambdaFileProcessor(unittest.TestCase):

    @patch("lambda_function.s3_client")
    def test_lambda_valid_attachment(self, mock_s3):
        mock_s3.head_object.return_value = {
            "ContentLength": 1024 * 50,
            "ContentType": "image/png",
            "ETag": '"test-etag-123"'
        }

        event = {
            "Records": [{
                "eventName": "ObjectCreated:Put",
                "s3": {
                    "bucket": {"name": "test-attachment-bucket"},
                    "object": {"key": "attachments/ticket-1/screenshot.png"}
                }
            }]
        }

        result = lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(result["processed_records"], 1)
        self.assertEqual(result["results"][0]["status"], "PROCESSED")

    @patch("lambda_function.s3_client")
    def test_lambda_rejected_extension(self, mock_s3):
        event = {
            "Records": [{
                "eventName": "ObjectCreated:Put",
                "s3": {
                    "bucket": {"name": "test-attachment-bucket"},
                    "object": {"key": "attachments/ticket-1/malware.exe"}
                }
            }]
        }

        result = lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(result["results"][0]["status"], "REJECTED")
        self.assertIn("Forbidden file extension", result["results"][0]["reason"])

    @patch("lambda_function.s3_client")
    def test_lambda_skipped_prefix(self, mock_s3):
        event = {
            "Records": [{
                "eventName": "ObjectCreated:Put",
                "s3": {
                    "bucket": {"name": "test-attachment-bucket"},
                    "object": {"key": "other-folder/data.pdf"}
                }
            }]
        }

        result = lambda_handler(event, None)
        self.assertEqual(result["statusCode"], 200)
        self.assertEqual(result["results"][0]["status"], "SKIPPED")

if __name__ == "__main__":
    unittest.main()
