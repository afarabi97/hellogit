import os
import unittest
from unittest.mock import patch

import app.utils.db_mngs
from app import create_app
from mongomock import MongoClient
from tests.static_data import nodes_collection, jobs_collection

os.environ['IS_DEBUG_SERVER'] = "yes"

class PyMongoMock(MongoClient):
    def init_app(self, app):
        return super().__init__()

class BaseTestCase(unittest.TestCase):

    def setUp(self):
        with patch.object(app.utils.db_mngs, "mongo", PyMongoMock()) as mongo_mock:
            self.flask_app = create_app().test_client()
            # Preload nodes collection
            mongo_mock.db.nodes.insert_many(nodes_collection)
            mongo_mock.db.jobs.insert_many(jobs_collection)
