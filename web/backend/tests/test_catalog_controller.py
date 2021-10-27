from tests.static_data import nodes_collection
from tests.test_base import BaseTestCase


class CatalogControllerTest(BaseTestCase):
    def test_node_details(self):
        results = self.flask_app.get('/api/catalog/nodes')
        self.assertEqual(nodes_collection, results.get_json())
