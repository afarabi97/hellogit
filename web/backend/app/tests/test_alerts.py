import os
import sys
import json
import shutil
import tempfile
import unittest
import zipfile
from datetime import datetime
from time import sleep
from app import app
from pathlib import Path
from typing import Dict, List
# Standard library imports...
from unittest.mock import MagicMock, Mock, patch
from app.alerts_controller import AlertsFieldsCtrl, AlertsCtrlv2, AlertsAckCtrl, build_query_clause
from app.service.hive_service import HiveService, HiveFailureError
from requests import Request, Session
from requests.models import Response
from datetime import datetime, timedelta
from freezegun import freeze_time

os.environ['IS_DEBUG_SERVER'] = "yes"

class TestAlertsController(unittest.TestCase):

    @classmethod
    def setUpClass(self):
        "set up test fixtures"
        print('### Setting up flask server ###')
        self.app = app.test_client()

    @classmethod
    def tearDownClass(self):
        "tear down test fixtures"
        print('### Tearing down the flask server ###')


    @patch("app.alerts_controller.ElasticWrapper")
    def test_get_alert_fields(self, mock_es):
        expected_results = ['dns.answers.data', 'file.group', 'service.type', 'vlan.name']
        mock_es.return_value.indices.exists.return_value = True
        mock_es.return_value.indices.get_field_mapping.return_value = {"filebeat-suricata-2021.01.29-000001":{"mappings":{"vlan.name":{"full_name":"vlan.name","mapping":{"name":{"type":"keyword","ignore_above":1024}}},"file.group":{"full_name":"file.group","mapping":{"group":{"type":"keyword","ignore_above":1024}}},"dns.answers.data":{"full_name":"dns.answers.data","mapping":{"data":{"type":"keyword","ignore_above":1024}}},"service.type":{"full_name":"service.type","mapping":{"type":{"type":"keyword","ignore_above":1024}}}}}}
        results = self.app.get('/api/alerts/fields')
        self.assertEqual(expected_results, results.get_json())
        self.assertEqual(200, results.status_code)


    def test_constuct_aggs(self):
        input_fields = ['event.category', 'event.kind', 'rule.name']
        expected_results = {'aggs': {'event.category': {'terms': {'field': 'event.category', 'size': 100}, 'aggs': {'event.kind': {'terms': {'field': 'event.kind', 'size': 100}, 'aggs': {'rule.name': {'terms': {'field': 'rule.name', 'size': 100}}}}}}}}
        test = AlertsCtrlv2()
        results = test._constuct_aggs(input_fields)
        self.assertEqual(expected_results, results)

    def test_table_contents(self):
        fields = ['event.category', 'event.kind', 'rule.name']
        payload = {'took': 18, 'timed_out': False, '_shards': {'total': 8, 'successful': 8, 'skipped': 0, 'failed': 0}, 'hits': {'total': {'value': 9662, 'relation': 'eq'}, 'max_score': None, 'hits': []}, 'aggregations': {'event.category': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'network', 'doc_count': 1790, 'event.kind': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'event', 'doc_count': 1629, 'rule.name': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': []}}, {'key': 'alert', 'doc_count': 161, 'rule.name': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'non_ip_packet_in_ethernet', 'doc_count': 132}, {'key': 'unknown_protocol', 'doc_count': 25}, {'key': 'possible_split_routing', 'doc_count': 4}]}}]}}]}}}
        table_rows = []
        expected_results = [{'count': 132, 'event.category': 'network', 'event.kind': 'alert', 'rule.name': 'non_ip_packet_in_ethernet'}, {'count': 25, 'event.category': 'network', 'event.kind': 'alert', 'rule.name': 'unknown_protocol'}, {'count': 4, 'event.category': 'network', 'event.kind': 'alert', 'rule.name': 'possible_split_routing'}]
        alert = AlertsCtrlv2()
        alert._get_table_contents(query_payload=payload, fields=fields, table_rows=table_rows)
        self.assertEqual(expected_results, table_rows)


    @freeze_time("2020-04-26")
    def test_build_clause_hours_signals(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}, {'match': {'signal.status': 'open'}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'signal.original_event.kind': 'alert'}}], 'should': [{'match': {'event.kind': 'signal'}}]}}
        results = build_query_clause(acknowledged="no", escalated="no", time_interval="hours", time_amt="24", search_kind="signal")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_hours(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'event.acknowledged': True}}, {'match': {'event.escalated': True}}], 'should': [{'match': {'event.kind': 'alert'}}]}}
        results = build_query_clause(acknowledged="no", escalated="no", time_interval="hours", time_amt="24", search_kind="alert")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_alert_acknowledged(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}, {'match': {'event.acknowledged': True}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'event.escalated': True}}], 'should': [{'match': {'event.kind': 'alert'}}]}}
        results = build_query_clause(acknowledged="yes", escalated="no", time_interval="hours", time_amt="24", search_kind="alert")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_alert_escalated(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}, {'match': {'event.escalated': True}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'event.acknowledged': True}}], 'should': [{'match': {'event.kind': 'alert'}}]}}
        results = build_query_clause(acknowledged="no", escalated="yes", time_interval="hours", time_amt="24", search_kind="alert")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_signal_acknowledged(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}, {'match': {'signal.status': 'closed'}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'signal.original_event.kind': 'alert'}}], 'should': [{'match': {'event.kind': 'signal'}}]}}
        results = build_query_clause(acknowledged="yes", escalated="no", time_interval="hours", time_amt="24", search_kind="signal")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_signal_escalated(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-25T00:00:00'}}}, {'match': {'signal.status': 'in-progress'}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'signal.original_event.kind': 'alert'}}], 'should': [{'match': {'event.kind': 'signal'}}]}}
        results = build_query_clause(acknowledged="no", escalated="yes", time_interval="hours", time_amt="24", search_kind="signal")
        self.assertEqual(expected_results, results)


    @freeze_time("2020-04-26")
    def test_build_clause_days(self):
        expected_results = {'bool': {'must': [{'range': {'@timestamp': {'gte': '2020-04-24T00:00:00'}}}], 'must_not': [{'match': {'event.hive_status': 'Resolved'}}, {'match': {'event.acknowledged': True}}, {'match': {'event.escalated': True}}], 'should': [{'match': {'event.kind': 'alert'}}]}}
        results = build_query_clause(acknowledged="no", escalated="no", time_interval="days", time_amt="2", search_kind="alert")
        self.assertEqual(expected_results, results)


    @unittest.expectedFailure
    @freeze_time("2020-04-26")
    def test_build_clause_signal_acknowledged_empty(self):
        build_query_clause(acknowledged=None, escalated="no", time_interval="hours", time_amt="24", search_kind="signal")


    @unittest.expectedFailure
    @freeze_time("2020-04-26")
    def test_build_clause_signal_invalid_acknowledged(self):
        build_query_clause(acknowledged="invalid", escalated="no", time_interval="hours", time_amt="24", search_kind="signal")


    @unittest.expectedFailure
    @freeze_time("2020-04-26")
    def test_build_clause_invalid_time_internal(self):
        build_query_clause(acknowledged="no", escalated="no", time_interval="novalidtimeinternal", time_amt="24", search_kind="alert")


    @unittest.expectedFailure
    @freeze_time("2020-04-26")
    def test_build_clause_invalid_search_kind(self):
        build_query_clause(acknowledged="no", escalated="no", time_interval="hours", time_amt="24", search_kind="invalidsearchkind")


    @patch("app.alerts_controller.ElasticWrapper")
    @patch.object(AlertsCtrlv2, '_SEARCH_KINDS', ['alert'])
    def test_get_alerts(self, mock_es):
        mock_es.return_value.search.return_value = {"took": 20, "timed_out": False, "_shards": {"total": 8, "successful": 8, "skipped": 0, "failed": 0}, "hits": {"total": {"value": 10000, "relation": "gte"}, "max_score": None, "hits": []}, "aggregations": {"event.category": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "network", "doc_count": 3386, "event.kind": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "event", "doc_count": 2620, "rule.name": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": []}}, {"key": "alert", "doc_count": 766, "rule.name": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "data_before_established", "doc_count": 230}, {"key": "possible_split_routing", "doc_count": 202}, {"key": "non_ip_packet_in_ethernet", "doc_count": 135}, {"key": "active_connection_reuse", "doc_count": 76}, {"key": "unknown_protocol", "doc_count": 49}, {"key": "inappropriate_FIN", "doc_count": 47}, {"key": "bad_ICMP_checksum", "doc_count": 16}, {"key": "bad_UDP_checksum", "doc_count": 5}, {"key": "TCP_ack_underflow_or_misorder", "doc_count": 4}, {"key": "ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010", "doc_count": 2}]}}]}}, {"key": "intrusion_detection", "doc_count": 10, "event.kind": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "alert", "doc_count": 10, "rule.name": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "CaptureLoss::Too_Much_Loss", "doc_count": 8}, {"key": "ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010", "doc_count": 2}]}}]}}, {"key": "authentication", "doc_count": 2, "event.kind": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "event", "doc_count": 2, "rule.name": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": []}}]}}, {"key": "file", "doc_count": 2, "event.kind": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": [{"key": "event", "doc_count": 2, "rule.name": {"doc_count_error_upper_bound": 0, "sum_other_doc_count": 0, "buckets": []}}]}}]}}}
        expected_results = [{"count":230,"event.category":"network","event.kind":"alert","rule.name":"data_before_established"},{"count":202,"event.category":"network","event.kind":"alert","rule.name":"possible_split_routing"},{"count":135,"event.category":"network","event.kind":"alert","rule.name":"non_ip_packet_in_ethernet"},{"count":76,"event.category":"network","event.kind":"alert","rule.name":"active_connection_reuse"},{"count":49,"event.category":"network","event.kind":"alert","rule.name":"unknown_protocol"},{"count":47,"event.category":"network","event.kind":"alert","rule.name":"inappropriate_FIN"},{"count":16,"event.category":"network","event.kind":"alert","rule.name":"bad_ICMP_checksum"},{"count":8,"event.category":"intrusion_detection","event.kind":"alert","rule.name":"CaptureLoss::Too_Much_Loss"},{"count":5,"event.category":"network","event.kind":"alert","rule.name":"bad_UDP_checksum"},{"count":4,"event.category":"network","event.kind":"alert","rule.name":"TCP_ack_underflow_or_misorder"},{"count":2,"event.category":"network","event.kind":"alert","rule.name":"ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010"},{"count":2,"event.category":"intrusion_detection","event.kind":"alert","rule.name":"ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010"}]
        results = self.app.get('/api/alerts/no/no/no/24/hours/event.category,event.kind,rule.name')
        self.assertEqual(expected_results, results.get_json())
        self.assertEqual(200, results.status_code)


    @patch("app.alerts_controller.ElasticWrapper")
    @patch.object(AlertsCtrlv2, '_SEARCH_KINDS', ['signal'])
    def test_get_alert_signals(self, mock_es):
        mock_es.return_value.search.return_value = {'took': 5, 'timed_out': False, '_shards': {'total': 1, 'successful': 1, 'skipped': 0, 'failed': 0}, 'hits': {'total': {'value': 392, 'relation': 'eq'}, 'max_score': None, 'hits': []}, 'aggregations': {'event.module': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'zeek', 'doc_count': 392, 'event.kind': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'signal', 'doc_count': 392, 'signal.rule.name': {'doc_count_error_upper_bound': 0, 'sum_other_doc_count': 0, 'buckets': [{'key': 'DNS Activity to the Internet', 'doc_count': 200}, {'key': 'SMTP on Port 26/TCP', 'doc_count': 48}, {'key': 'PPTP (Point to Point Tunneling Protocol) Activity', 'doc_count': 46}, {'key': 'SSH (Secure Shell) to the Internet', 'doc_count': 35}, {'key': 'IRC (Internet Relay Chat) Protocol Activity to the Internet', 'doc_count': 22}, {'key': 'SMTP to the Internet', 'doc_count': 13}, {'key': 'FTP (File Transfer Protocol) Activity to the Internet', 'doc_count': 10}, {'key': 'SSH (Secure Shell) from the Internet', 'doc_count': 10}, {'key': 'SMB (Windows File Sharing) Activity to the Internet', 'doc_count': 4}, {'key': 'Proxy Port Activity to the Internet', 'doc_count': 3}, {'key': 'TCP Port 8000 Activity to the Internet', 'doc_count': 1}]}}]}}]}}}
        expected_results = [{"count":200,"event.module":"zeek","event.kind":"signal","rule.name":"DNS Activity to the Internet"},{"count":48,"event.module":"zeek","event.kind":"signal","rule.name":"SMTP on Port 26/TCP"},{"count":46,"event.module":"zeek","event.kind":"signal","rule.name":"PPTP (Point to Point Tunneling Protocol) Activity"},{"count":35,"event.module":"zeek","event.kind":"signal","rule.name":"SSH (Secure Shell) to the Internet"},{"count":22,"event.module":"zeek","event.kind":"signal","rule.name":"IRC (Internet Relay Chat) Protocol Activity to the Internet"},{"count":13,"event.module":"zeek","event.kind":"signal","rule.name":"SMTP to the Internet"},{"count":10,"event.module":"zeek","event.kind":"signal","rule.name":"FTP (File Transfer Protocol) Activity to the Internet"},{"count":10,"event.module":"zeek","event.kind":"signal","rule.name":"SSH (Secure Shell) from the Internet"},{"count":4,"event.module":"zeek","event.kind":"signal","rule.name":"SMB (Windows File Sharing) Activity to the Internet"},{"count":3,"event.module":"zeek","event.kind":"signal","rule.name":"Proxy Port Activity to the Internet"},{"count":1,"event.module":"zeek","event.kind":"signal","rule.name":"TCP Port 8000 Activity to the Internet"}]
        results = self.app.get('/api/alerts/no/no/no/24/hours/event.module,event.kind,rule.name')
        self.assertEqual(expected_results, results.get_json())
        self.assertEqual(200, results.status_code)

    @patch("app.alerts_controller.ElasticWrapper")
    def test_update_alerts(self, mock_es):
        data =  {"count":97,"event.module":"zeek","event.kind":"alert","rule.name":"line_terminated_with_single_CR","form":{"acknowledged":False,"escalated":False,"timeInterval":"hours","timeAmount":24,"performEscalation":False}}
        mock_es.return_value.update_by_query.return_value = {"took":116,"timed_out":False,"total":97,"updated":97,"deleted":0,"batches":1,"version_conflicts":0,"noops":0,"retries":{"bulk":0,"search":0},"throttled_millis":0,"requests_per_second":-1,"throttled_until_millis":0,"failures":[]}
        expected_results = {"took":116,"timed_out":False,"total":97,"updated":97,"deleted":0,"batches":1,"version_conflicts":0,"noops":0,"retries":{"bulk":0,"search":0},"throttled_millis":0,"requests_per_second":-1,"throttled_until_millis":0,"failures":[]}
        results = self.app.post('/api/alerts/modify',
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(expected_results, results.get_json())

    def _fake_create_hive_case(self):
        return {'_id': '~73976', 'id': '~73976', 'createdBy': 'org_admin@hive.local', 'updatedBy': None, 'createdAt': 1614118819792, 'updatedAt': None, '_type': 'case', 'caseId': 3, 'title': 'active_connection_reuse', 'description': '[Kibana SIEM Link](https://kibana.lan/app/security/network/external-alerts?query=%28language:kuery,query:%27event.module%20:%20"zeek"%20and%20event.kind%20:%20"alert"%20and%20rule.name%20:%20"active_connection_reuse"%20and%20event.escalated%20:%20"true"%27%29&timerange=%28global:%28linkTo:!%28timeline%29,timerange:%28from:%272021-02-22T22:20:13.909Z%27,fromStr:now-24h,kind:relative,to:%272021-02-23T22:20:13.909Z%27,toStr:now%29%29,timeline:%28linkTo:!%28global%29,timerange:%28from:%272021-02-22T22:20:13.909Z%27,fromStr:now-24h,kind:relative,to:%272021-02-23T22:20:13.909Z%27,toStr:now%29%29%29)\n\n[Arkime Link](N/A - Failed to create Moloch link because you need one of the following Group By fields: source.address, source.ip, source.port, destination.port, destination.address, destination.ip)', 'severity': 2, 'startDate': 1614118819000, 'endDate': None, 'impactStatus': None, 'resolutionStatus': None, 'tags': [], 'flag': False, 'tlp': 2, 'pap': 2, 'status': 'Open', 'summary': None, 'owner': 'org_admin@hive.local', 'customFields': {'count': {'integer': 48, 'order': 0}, 'event.kind': {'string': 'alert', 'order': 1}, 'event.module': {'string': 'zeek', 'order': 2}, 'rule.name': {'string': 'active_connection_reuse', 'order': 3}}, 'stats': {}, 'permissions': ['manageShare', 'manageAnalyse', 'manageTask', 'manageCaseTemplate', 'manageCase', 'manageUser', 'managePage', 'manageObservable', 'manageConfig', 'manageAlert', 'manageAction']}

    @patch("app.alerts_controller.ElasticWrapper")
    @patch.object(HiveService, 'create_hive_case', _fake_create_hive_case)
    def test_hive_service(self, mock_es):
        payload = {"count":97,"event.module":"zeek","event.kind":"alert","rule.name":"bad_HTTP_request","form":{"acknowledged":False,"escalated":False,"timeInterval":"hours","timeAmount":24,"performEscalation":True,"hiveForm":{"event_title":"bad_HTTP_request","event_tags":"tests","event_severity":"2","event_description":'"{"_index":"filebeat-zeek-2021.02.01-000001","_type":"_doc","_id":"ZGGYg3cB7xs3QRxPrCOt","_score":13.143599,"_source":{"agent":{"hostname":"dev-sensor1-zeek-filebeat-7cfcff8d4c-qb8gw","name":"dev-sensor1-zeek","id":"fab4d83e-04eb-4276-bc7e-da0875572ba5","ephemeral_id":"a83e5689-d4a1-4df1-b691-4a45e4db60ae","type":"filebeat","version":"7.9.3"},"log":{"file":{"path":"/var/log/bro/current/weird.log"},"offset":10270599},"destination":{"geo":{"continent_name":"North America","country_iso_code":"US","location":{"lon":-97.822,"lat":37.751},"as":{"number":15169,"organization":{"name":"Google LLC"},"address":"173.194.75.103","port":80,"ip":"173.194.75.103"},"zeek":{"weird":{"additional_info":"CCM_POST","peer":"ens224-5","name":"unknown_HTTP_method","notice":False},"session_id":"CwrLC1bp7Vbe4Vgk6"},"rule":{"name":"unknown_HTTP_method"},"source":{"geo":{"continent_name":"North America","region_iso_code":"US-PA","city_name":"Pittsburgh","country_iso_code":"US","region_name":"Pennsylvania","location":{"lon":-79.9557,"lat":40.4442},"as":{"number":9,"organization":{"name":"Carnegie Mellon University"},"address":"128.2.6.136","port":46581,"ip":"128.2.6.136"},"fileset":{"name":"weird"},"tags":["forwarded" ],"observer":{"hostname":"dev-sensor1.lan"},"input":{"type":"log"},"@timestamp":"2021-02-08T21:42:29.339Z","ecs":{"version":"1.5.0"},"related":{"ip":["128.2.6.136","173.194.75.103"]},"service":{"type":"zeek"},"event":{"kind":"alert","created":"2021-02-08T21:42:36.068100920Z","module":"zeek","id":"CwrLC1bp7Vbe4Vgk6","category":["network"],"type":["info"],"dataset":"zeek.weird"'}}}
        mock_es.return_value.update_by_query.return_value = {"took":4,"timed_out":False,"total":97,"updated":0,"deleted":0,"batches":0,"version_conflicts":0,"noops":0,"retries":{"bulk":0,"search":0},"throttled_millis":0,"requests_per_second":-1.0,"throttled_until_millis":0,"failures":[]}
        expected_results = {"took":4,"timed_out":False,"total":97,"updated":0,"deleted":0,"batches":0,"version_conflicts":0,"noops":0,"retries":{"bulk":0,"search":0},"throttled_millis":0,"requests_per_second":-1.0,"throttled_until_millis":0,"failures":[]}
        results = self.app.post('/api/alerts/modify',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(expected_results, results.get_json())

    @unittest.expectedFailure
    @patch("app.service.hive_service")
    @patch("app.alerts_controller.ElasticWrapper")
    def test_hive_service_failure(self, mock_hive_service, mock_es):
        expected_results = {"message":"InternalServerError","took":4,"timed_out":False,"total":4,"updated":0,"deleted":0,"failures":[],"batches":0,"version_conflicts":0,"noops":0,"retries":{"bulk":0,"search":0},"throttled_millis":0,"requests_per_second":-1.0,"throttled_until_millis":0}
        results = test_hive_service(acknowledged="no", escalated="no", time_interval="hours", timeAmount="24", performEscalation="yes", event_kind="alert")
