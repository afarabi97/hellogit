from unittest.mock import patch

import pytest
from app.service.rulesync_service import RuleSynchronization
from app.utils.collections import Collections, get_collection
from app.utils.constants import RULESET_STATES
from tests.unit.static_data.rule_set import (error_sensors_ruleset,
                                             rule_sets_mongo_static_data,
                                             synced_sensors_ruleset)


@pytest.fixture
def ruleset_client_initialize(client):
    get_collection(Collections.RULESET).insert_many(rule_sets_mongo_static_data)
    return client


# class RuleSynchronization:
class TestRuleSynchronization():


    def setup(self):
        self.test_class = RuleSynchronization()


    # def _clear_states(self, rule_sets: List[RuleSetModel]) -> None:
    def test__clear_states__call_clear_state(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._clear_state') as mocked_method:
            self.test_class._clear_states()
            mocked_method.assert_called()


    def test__clear_states__call_get_rulesets(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_rulesets') as mocked_method:
            self.test_class._clear_states()
            mocked_method.assert_called()


    def test__clear_states__clears_all_states(self, ruleset_client_initialize):
        self.test_class._clear_states()
        rule_sets = list(get_collection(Collections.RULESET).find({}))
        for rule_set in rule_sets:
            assert rule_set["sensor_states"] == []


    # def _clear_state(self, rule_set: RuleSetModel.DTO) -> None:
    def test__clear_state(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._clear_state') as mocked_method:
            self.test_class._clear_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called_once_with(rule_sets_mongo_static_data[0])

    def test__clear_state__call_mongo_ruleset(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset') as mocked_method:
            self.test_class._clear_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()

    def test__clear_state__call_mongo_ruleset_and_clear_state(self, ruleset_client_initialize):
        self.test_class._clear_state(rule_sets_mongo_static_data[0])
        rule_sets = list(get_collection(Collections.RULESET).find({}))
        for rule_set in rule_sets:
            if rule_sets_mongo_static_data[0]["_id"] == rule_set["_id"]:
                assert rule_set["sensor_states"] == []

    def test__clear_state__call_notification_set_status(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.NotificationMessage.set_status') as mocked_method:
            self.test_class._clear_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()

    def test__clear_state__call_notification_set_message(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.NotificationMessage.set_message') as mocked_method:
            self.test_class._clear_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()

    def test__clear_state__exception__call_notification_set_status(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset', side_effect=Exception({"error": "mocked error"})):
            with patch('app.service.rulesync_service.NotificationMessage.set_status') as mocked_method:
                self.test_class._clear_state(rule_sets_mongo_static_data[0])
                mocked_method.assert_called()

    def test__clear_state__exception__call_notification_set_message(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset', side_effect=Exception({"error": "mocked error"})):
            with patch('app.service.rulesync_service.NotificationMessage.set_message') as mocked_method:
                self.test_class._clear_state(rule_sets_mongo_static_data[0])
                mocked_method.assert_called()

    def test__clear_state__exception__call_notification_set_exception(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset', side_effect=Exception({"error": "mocked error"})):
            with patch('app.service.rulesync_service.NotificationMessage.set_exception') as mocked_method:
                self.test_class._clear_state(rule_sets_mongo_static_data[0])
                mocked_method.assert_called()

    def test__clear_state__call_notification_post_to_websocket_api(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.NotificationMessage.post_to_websocket_api') as mocked_method:
            self.test_class._clear_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()


    # def _update_rule_set_states(self) -> None:
    def test__update_rule_set_states(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._update_rule_set_states') as mocked_method:
            self.test_class._update_rule_set_states()
            mocked_method.assert_called_once_with()


    def test__update_rule_set_states__call_get_rulesets(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_rulesets') as mocked_method:
            self.test_class._update_rule_set_states()
            mocked_method.assert_called()


    def test__update_rule_set_states__call_update_rule_set_state(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._update_rule_set_state') as mocked_method:
            self.test_class._update_rule_set_states()
            mocked_method.assert_called()


    # def _update_rule_set_state(self, rule_set: RuleSetModel.DTO) -> None:
    def test__update_rule_set_state(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._update_rule_set_state') as mocked_method:
            self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called_once_with(rule_sets_mongo_static_data[0])


    def test__update_rule_set_state__call_get_rule_set_rules_length(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_rule_set_rules_length') as mocked_method:
            self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()


    def test__update_rule_set_state__call_get_worse_state_from_sensor_states(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_worse_state_from_sensor_states') as mocked_method:
            self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()


    def test__update_rule_set_state__call_rq_logger_info(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.rq_logger.info') as mocked_method:
            self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
            mocked_method.assert_called()


    def test__update_rule_set_state__call_rq_logger_info_from_exception(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset', side_effect=Exception({"error": "mocked error"})):
            with patch('app.service.rulesync_service.rq_logger.info') as mocked_method:
                self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
                mocked_method.assert_called()


    def test__update_rule_set_state__call_rq_logger_exception_from_exception(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.mongo_ruleset', side_effect=Exception({"error": "mocked error"})):
            with patch('app.service.rulesync_service.rq_logger.exception') as mocked_method:
                self.test_class._update_rule_set_state(rule_sets_mongo_static_data[0])
                mocked_method.assert_called()


    # def _get_rule_set_rules_length(self, rule_set_id: str) -> int:
    def test__get_rule_set_rules_length(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_rule_set_rules_length') as mocked_method:
            self.test_class._get_rule_set_rules_length(synced_sensors_ruleset["_id"])
            mocked_method.assert_called_once_with(synced_sensors_ruleset["_id"])


    def test__get_rule_set_rules_length__return_int(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_rule_set_rules_length', return_value=1) as mocked_method:
            self.test_class._get_rule_set_rules_length(synced_sensors_ruleset["_id"])
            assert mocked_method.return_value == 1


    # def _get_worse_state_from_sensor_states(self, rule_set: RuleSetModel.DTO) -> str:
    def test__get_worse_state_from_sensor_states(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_worse_state_from_sensor_states') as mocked_method:
            self.test_class._get_worse_state_from_sensor_states(synced_sensors_ruleset, 1)
            mocked_method.assert_called_once_with(synced_sensors_ruleset, 1)


    def test__get_worse_state_from_sensor_states__return_synced(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_worse_state_from_sensor_states', return_value=RULESET_STATES[2]) as mocked_method:
            self.test_class._get_worse_state_from_sensor_states(synced_sensors_ruleset, 1)
            assert mocked_method.return_value == RULESET_STATES[2]


    def test__get_worse_state_from_sensor_states__return_error_has_sensor_states_and_rules(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_worse_state_from_sensor_states', return_value=RULESET_STATES[3]) as mocked_method:
            self.test_class._get_worse_state_from_sensor_states(error_sensors_ruleset, 1)
            assert mocked_method.return_value == RULESET_STATES[3]


    def test__get_worse_state_from_sensor_states__return_error_has_sensor_states_and_no_rules(self, ruleset_client_initialize):
        with patch('app.service.rulesync_service.RuleSynchronization._get_worse_state_from_sensor_states', return_value=RULESET_STATES[3]) as mocked_method:
            self.test_class._get_worse_state_from_sensor_states(error_sensors_ruleset, 0)
            assert mocked_method.return_value == RULESET_STATES[3]

