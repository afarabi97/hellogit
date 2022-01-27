import io
from tests.test_base import BaseTestCase
from tests import TEST_SAMPLES_DIR
from pathlib import Path
import io

class TestToolsController(BaseTestCase):

    def test_update_docs(self):
        # Test successful condition
        payload = {"upload_file": (open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", 'rb'), "v3.6.1_Supplemental_Guide.zip"),
                   "space_name": "THISISCVAH"}
        results = self.flask_app.post("/api/tools/documentation/upload",
                                      data=payload,
                                      content_type="multipart/form-data")
        self.assertEquals(200, results.status_code)
        self.assertTrue(Path("/var/www/html/docs/THISISCVAH").exists())

        # Test condition that saves the file in a weird place
        payload = {"upload_file": (open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", 'rb'), "v3.6.1_Supplemental_Guide.zip"),
                   "space_name": "../../../root/THISISCVAH"}
        results = self.flask_app.post("/api/tools/documentation/upload",
                                      data=payload,
                                      content_type="multipart/form-data")
        self.assertEquals(400, results.status_code)
        self.assertTrue('error_message' in results.json)

        # Test null character
        payload = {"upload_file": (open(TEST_SAMPLES_DIR + "/v3.6.1_Supplemental_Guide.zip", 'rb'), "v3.6.1_Supplemental_Guide.zip"),
                   "space_name": '\x00'}
        results = self.flask_app.post("/api/tools/documentation/upload",
                                      data=payload,
                                      content_type="multipart/form-data")
        self.assertEquals(400, results.status_code)
        self.assertTrue('error_message' in results.json)
