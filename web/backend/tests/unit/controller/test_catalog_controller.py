from app.utils.collections import Collections, get_collection
from tests.unit.static_data import nodes_collection


def test_node_details(client):
    get_collection(Collections.NODES).insert_many(nodes_collection)
    results = client.get("/api/catalog/nodes")
    assert nodes_collection == results.get_json()
