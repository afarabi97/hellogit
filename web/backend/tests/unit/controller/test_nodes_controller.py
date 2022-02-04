from tests.unit.static_data import get_node_expected
from tests.unit.static_data import nodes_collection, jobs_collection
from app.utils.collections import get_collection, Collections


def test_node(client):
    get_collection(Collections.NODES).insert_many(nodes_collection)
    get_collection(Collections.JOBS).insert_many(jobs_collection)
    results = client.get("/api/kit/node/md2-sensor3.kit200")
    assert get_node_expected == results.get_json()
