from app.utils.collections import Collections, get_collection
from tests.unit.static_data.node import (nodes_collection,
                                         nodes_collection_node_sensor_install,
                                         suricata_saved_values)

# class ConfiguredIfaces(Resource):

# def get(self, sensor_hostname: str) -> Response:
def test__configured_ifaces_get__suricata(client):
    # Ensure that if only suricata is saved we get values as expected
    get_collection(Collections.CATALOG_SAVED_VALUES).insert_one(suricata_saved_values)
    results = client.get("/api/catalog/configured-ifaces/sensor1.deadshot")
    assert ['ens3f1'] == results.get_json()


# class NodeDetails(Resource):

# def get(self) -> Response:
def test__node_details_get(client):
    get_collection(Collections.NODES).insert_many(nodes_collection)
    results = client.get("/api/catalog/nodes")
    assert nodes_collection == results.get_json()


def test__node_details_get__new_node_install(client):
    get_collection(Collections.NODES).insert_many(nodes_collection_node_sensor_install)
    results = client.get("/api/catalog/nodes")
    assert nodes_collection == results.get_json()
    assert len(results.get_json()) == 6
    assert len(results.get_json()) < len(nodes_collection_node_sensor_install)
