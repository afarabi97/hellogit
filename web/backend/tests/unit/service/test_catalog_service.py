from app.utils.collections import Collections, get_collection
from tests.unit.static_data import zeek_ruleset
from app.service.catalog_service import (_remove_sensor_from_ruleset_assignment)
import json


def test_remove_sensor_from_ruleset_assignment(client):
    get_collection(Collections.RULESET).insert_one(zeek_ruleset)
    _remove_sensor_from_ruleset_assignment("test-sensor.test", "zeek")
    results = client.get("api/policy/ruleset")
    assert json.loads(results.data)[0]['sensors'] == []
    assert 200 == results.status_code
