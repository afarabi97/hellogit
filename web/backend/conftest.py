"""Provides the basic fixture to mock the database and generate a test client."""
import os
from unittest.mock import patch

import app.utils.collections as mongo
import pytest
from app import create_app
from mongomock import MongoClient

os.environ["IS_DEBUG_SERVER"] = "yes"


class PyMongoMock(MongoClient):
    def init_app(self):
        return super().__init__()


@pytest.fixture
def client():
    with patch.object(mongo, "mongo", PyMongoMock()):
        app = create_app({"TESTING": True})
        with app.test_client() as test_client:
            yield test_client
