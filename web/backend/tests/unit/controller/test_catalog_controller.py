from app.utils.collections import Collections, get_collection
from tests.unit.static_data import nodes_collection, suricata_saved_values


def test_node_details(client):
    get_collection(Collections.NODES).insert_many(nodes_collection)
    results = client.get("/api/catalog/nodes")
    assert nodes_collection == results.get_json()


def test_configure_ifaces_suricata(client):
    # Ensure that if only suricata is saved we get values as expected
    get_collection(Collections.CATALOG_SAVED_VALUES).insert_one(suricata_saved_values)
    results = client.get("/api/catalog/configured-ifaces/sensor1.deadshot")
    assert ['ens3f1'] == results.get_json()
