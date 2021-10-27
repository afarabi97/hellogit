from tests.static_data import get_node_expected
from tests.test_base import BaseTestCase

class NodeControllerTest(BaseTestCase):
    def test_node(self):
        results = self.flask_app.get('/api/kit/node/md2-sensor3.kit200')
        self.assertEqual(get_node_expected, results.get_json())
