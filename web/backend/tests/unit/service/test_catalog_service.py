import json

from app.service.catalog_service import _remove_sensor_from_ruleset_assignment
from app.utils.collections import Collections, get_collection
from tests.unit.static_data.rule_set import zeek_ruleset


def test_remove_sensor_from_ruleset_assignment(client):
    get_collection(Collections.RULESET).insert_one(zeek_ruleset)
    _remove_sensor_from_ruleset_assignment("test-sensor.test", "zeek")
    results = client.get("api/policy/ruleset")
    assert json.loads(results.data)[0]['sensors'] == []
    assert results.status_code == 200
