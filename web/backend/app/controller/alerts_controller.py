"""
Main module for handling all of the config map REST calls.
"""
from collections import OrderedDict
from typing import Dict, List

from app.models.alerts import AlertsModel, HiveSettingsModel, UpdateAlertsModel
from app.models.common import COMMON_ERROR_DTO1
from app.service.hive_service import (HiveFailureError, HiveService,
                                      configure_webhook)
from app.utils.elastic import ElasticWrapper
from app.utils.namespaces import ALERTS_NS, HIVE_NS
from elasticsearch.exceptions import ConnectionTimeout, RequestError
from flask import Response, request
from flask_restx import Resource, fields
from marshmallow import ValidationError

DEFAULT_INDEXES = "filebeat-suricata-*,filebeat-zeek-*,endgame-*,filebeat-external-*"
SIGNAL_INDEX = ".siem-signals-default"
ALL_INDEXES = DEFAULT_INDEXES + "," + SIGNAL_INDEX
ELASTIC_TIMEOUT = 20


def build_query_clause(
    acknowledged: str,
    escalated: str,
    start_time: str,
    end_time: str,
    search_kind: str,
    additional_must_clauses=[],
    additional_must_not_clauses=[],
    show_closed: str = "no",
):

    if acknowledged not in ("no", "yes"):
        raise ValueError(
            "Invalid value passed in for acknowledge it must be either yes or no"
        )

    if escalated not in ("no", "yes"):
        raise ValueError(
            "Invalid value passed in for escalated it must be either yes or no"
        )

    if show_closed not in ("no", "yes"):
        raise ValueError(
            "Invalid value passed in for show_closed it must be either yes or no"
        )

    if search_kind not in ("alert", "signal"):
        raise ValueError("Invalid search_kind passed in.")

    match_acknowledge = {"match": {"event.acknowledged": True}}

    match_signal_closed = {"match": {"signal.status": "closed"}}

    match_signal_open = {"match": {"signal.status": "open"}}

    match_signal_inprogress = {"match": {"signal.status": "in-progress"}}

    match_escalated = {"match": {"event.escalated": True}}

    filter_clause = [{"match": {"event.kind": search_kind}}]

    signal_not_match = {"match": {"signal.original_event.kind": "alert"}}

    must_clause = [
        {"range": {"@timestamp": {"gte": start_time, "lte": end_time}}}]

    must_not_clause = []
    if show_closed == "yes":
        must_clause.append({"match": {"event.hive_status": "Resolved"}})
    else:
        must_not_clause.append({"match": {"event.hive_status": "Resolved"}})

    must_clause = must_clause + additional_must_clauses
    must_not_clause = must_not_clause + additional_must_not_clauses
    if search_kind == "signal":
        must_not_clause.append(signal_not_match)
        if acknowledged == "no" and escalated == "no":
            must_clause.append(match_signal_open)
        if acknowledged == "yes":
            must_clause.append(match_signal_closed)
        if show_closed == "yes":
            must_clause.append(match_signal_closed)
        elif escalated == "yes":
            must_clause.append(match_signal_inprogress)
    else:
        if acknowledged == "yes":
            must_clause.append(match_acknowledge)
        elif acknowledged == "no":
            must_not_clause.append(match_acknowledge)
        if escalated == "yes":
            must_clause.append(match_escalated)
        elif escalated == "no":
            must_not_clause.append(match_escalated)

    return {
        "bool": {
            "must": must_clause,
            "must_not": must_not_clause,
            "filter": filter_clause,
        }
    }


def get_additional_match_clauses(payload: Dict) -> List[Dict]:
    ret_val = []
    if "event.kind" in payload and payload["event.kind"] == "signal":
        payload["signal.rule.name"] = payload.pop("rule.name")
    for field in payload:
        if field == "form" or field == "count" or field == "links" or field == "kind":
            continue

        ret_val.append({"match": {field: payload[field]}})
    return ret_val


def hive_custom_fields_to_create(payload: Dict) -> List[Dict]:
    ret_val = []
    for field in payload:
        if field == "form" or field == "links" or field == "kind":
            continue
        value = payload[field]
        if isinstance(value, str):
            ret_val.append({"name": field, "type": "string", "value": value})
        elif isinstance(value, int):
            ret_val.append({"name": field, "type": "integer", "value": value})
        elif isinstance(value, bool):
            ret_val.append({"name": field, "type": "boolean", "value": value})
        elif isinstance(value, float):
            ret_val.append({"name": field, "type": "float", "value": value})

    return ret_val


def get_field_list(payload: Dict) -> List[Dict]:
    ret_val = ["@timestamp", "network.community_id"]
    for field in payload:
        if field == "form" or field == "count" or field == "links":
            continue

        ret_val.append(field)
    return ret_val


@ALERTS_NS.route("/fields")
class AlertsFieldsCtrl(Resource):
    @ALERTS_NS.doc(
        description="Returns a list of fields from filebeat and siem indices."
    )
    @ALERTS_NS.response(500, "Error")
    @ALERTS_NS.response(
        200,
        "AlertFields",
        [fields.String(example="event.module",
                       description="Field name from index.")],
    )
    def get(self) -> Response:
        elastic = ElasticWrapper()
        fields = []
        default_fields = (
            "agent.*,as.*,bucket_name.*,client.*,code_signature.*,destination.*,dll.*,dns.*,ecs.*,error.*,"
            "event.*,fields.*,file.*,fileset.*,geo.*,group.*,hash.*,host.*,http.*,icmp.*,igmp.*,input.*,interface.*,iptables.*,"
            "labels.*,log.*,message.*,nats.*,network.*,object_key.*,observer.*,organization.*,os.*,package.*,pe.*,process.*,"
            "registry.*,related.*,rule.*,server.*,service.*,source.*,stream.*,syslog.*,system.*,tags.*,threat.*,timeseries.*,"
            "tls.*,tracing.*,url.*,user.*,user_agent.*,vlan.*,vulnerability.*"
        )
        index_list = [
            {"index": "filebeat-suricata-*",
                "fields": default_fields + ",suricata.*"},
            {"index": "filebeat-zeek-*", "fields": default_fields + ",zeek.*"},
            {"index": ".siem-signals-default", "fields": "signal.rule.name"},
            {"index": "endgame-*", "fields": default_fields + ",endgame.*"},
        ]
        for ind in index_list:
            if elastic.indices.exists(index=ind["index"], allow_no_indices=False):
                payload = elastic.indices.get_field_mapping(
                    fields=ind["fields"],
                    index=ind["index"],
                    doc_type=None,
                    params=None,
                    headers=None,
                )
                if payload and len(list(payload.keys())) > 0:
                    ind_name = list(payload.keys())[0]
                    if ind_name and "mappings" in payload[ind_name]:
                        fields.extend(
                            list(payload[ind_name]["mappings"].keys()))
        unique_fields = list(OrderedDict.fromkeys(fields))
        unique_fields.sort()
        return unique_fields, 200


@ALERTS_NS.doc(
    params={
        "count_override": "Defaults to the count inside of the payload if you specifiy 0 otherwise it will override count."
    }
)
@ALERTS_NS.route("/list/<count_override>")
class AlertsDetailedCtrl(Resource):
    @ALERTS_NS.doc(description="Get all the alerts from Elasticsearch.")
    @ALERTS_NS.response(500, "Error")
    @ALERTS_NS.expect(UpdateAlertsModel.DTO)
    def post(self, count_override: int) -> Response:
        es = ElasticWrapper()
        search_index = DEFAULT_INDEXES
        payload = ALERTS_NS.payload
        acknowledged = "yes" if payload["form"]["acknowledged"] else "no"
        escalated = "yes" if payload["form"]["escalated"] else "no"
        show_closed = "yes" if payload["form"]["showClosed"] else "no"
        start_time = payload["form"]["startDatetime"]
        end_time = payload["form"]["endDatetime"]
        search_kind = "alert"
        if "event.kind" in payload:
            search_kind = payload["event.kind"]
        additional_must_clauses = get_additional_match_clauses(payload)
        body = {}
        body["query"] = build_query_clause(
            acknowledged=acknowledged,
            escalated=escalated,
            start_time=start_time,
            end_time=end_time,
            search_kind=search_kind,
            additional_must_clauses=additional_must_clauses,
            show_closed=show_closed,
        )
        if int(count_override) > 0:
            body["size"] = count_override
        else:
            fields = get_field_list(payload)
            body["_source"] = fields
            body["size"] = str(payload["count"])
            if int(payload["count"]) > 5000:
                body["size"] = "5000"
        if search_kind == "signal":
            search_index = SIGNAL_INDEX

        payload = es.search(
            body=body,
            index=search_index,
            doc_type=None,
            params=None,
            headers=None,
            request_timeout=ELASTIC_TIMEOUT,
        )
        return payload


@ALERTS_NS.route(
    "/<acknowledged>/<escalated>/<show_closed>/<start_time>/<end_time>/<fields>"
)
@ALERTS_NS.doc(
    params={
        "acknowledged": "yes or no are valid values.",
        "escalated": "yes or no are valid values.",
        "show_closed": "yes or no are valid values. When set to yes in conjuction with escalated also being set displays the closed escalated events.",
        "start_time": "The start datetime in ISO format.",
        "end_time": "The end datetime in ISO format.",
        "fields": "The fields to group by or aggregate by. They should be comma separated.",
    }
)
class AlertsCtrlv2(Resource):

    _SEARCH_KINDS = ["alert", "signal"]

    def _get_aggs_nested(self, aggs: Dict, fields: List[str]):
        aggs_ref = aggs
        for field in fields:
            aggs_ref = aggs_ref["aggs"][field]
        return aggs_ref

    def _constuct_aggs(self, fields: List[str]):
        aggs = {}
        for index, field in enumerate(fields):
            if index == 0:
                aggs["aggs"] = {
                    field: {"terms": {"field": field, "size": 100}}}
                continue

            aggs_ref = self._get_aggs_nested(aggs, fields[0:index])
            aggs_ref["aggs"] = {
                field: {"terms": {"field": field, "size": 100}}}

        return aggs

    def _get_row(self, aggs: Dict, fields: List[str], table_rows: List[Dict], row={}):
        field = fields.pop(0)
        for bucket in aggs[field]["buckets"]:
            row["count"] = bucket["doc_count"]
            row[field] = bucket["key"]

            if len(fields) > 0:
                self._get_row(bucket, fields.copy(), table_rows, row.copy())
            else:
                table_rows.append(row)
                row = row.copy()

    def _get_table_contents(
        self, query_payload: Dict, fields: List[str], table_rows: List[Dict]
    ):
        aggs = query_payload["aggregations"]
        for bucket in aggs[fields[0]]["buckets"]:
            row = {}
            row["count"] = bucket["doc_count"]
            row[fields[0]] = bucket["key"]
            if len(fields) > 1:
                self._get_row(bucket, fields[1:].copy(), table_rows, row)
            else:
                table_rows.append(row)

    def _fix_keyword_issue(self, e: RequestError, fields_ary: List[str]) -> str:
        field_to_replace = ""
        for field in fields_ary:
            if field in e.info["error"]["root_cause"][0]["reason"]:
                field_to_replace = field

        if field_to_replace == "":
            raise e

        for i, item in enumerate(fields_ary):
            if item == field_to_replace:
                fields_ary[i] = field_to_replace + ".keyword"

        return self._constuct_aggs(fields_ary)

    @ALERTS_NS.doc(description="Get all the alerts from Elasticsearch.")
    @ALERTS_NS.response(500, "Error")
    @ALERTS_NS.response(200, "Alerts", [AlertsModel.DTO])
    def get(
        self,
        acknowledged: str,
        escalated: str,
        show_closed: str,
        start_time: str,
        end_time: str,
        fields: str,
    ) -> Response:
        fields_ary = fields.split(",")
        elastic = ElasticWrapper()
        table_rows = []
        search_index = DEFAULT_INDEXES
        for search_kind in self._SEARCH_KINDS:
            if search_kind == "signal":
                if "rule.name" in fields_ary:
                    fields_ary[fields_ary.index(
                        "rule.name")] = "signal.rule.name"
                search_index = SIGNAL_INDEX
            body = self._constuct_aggs(fields_ary)
            body["size"] = 0
            body["query"] = build_query_clause(
                acknowledged=acknowledged,
                escalated=escalated,
                start_time=start_time,
                end_time=end_time,
                search_kind=search_kind,
                show_closed=show_closed,
            )
            try:
                payload = elastic.search(
                    body=body,
                    index=search_index,
                    doc_type=None,
                    params=None,
                    headers=None,
                    request_timeout=ELASTIC_TIMEOUT,
                )
            except ConnectionTimeout as e:
                return {
                    "message": "Elasticsearch query timed out after {} seconds.  To fix this, narrow the Window time by reducing the number of days / hours until the page refreshes successfully.".format(
                        ELASTIC_TIMEOUT
                    )
                }, 400
            except RequestError as e:
                body = self._fix_keyword_issue(e, fields_ary)
                body["size"] = 0
                body["query"] = build_query_clause(
                    acknowledged=acknowledged,
                    escalated=escalated,
                    start_time=start_time,
                    end_time=end_time,
                    search_kind=search_kind,
                    show_closed=show_closed,
                )
                payload = elastic.search(
                    body=body,
                    index=search_index,
                    doc_type=None,
                    params=None,
                    headers=None,
                    request_timeout=ELASTIC_TIMEOUT,
                )

            if "aggregations" in payload:
                self._get_table_contents(payload, fields_ary, table_rows)
                for row in table_rows:
                    if "event.kind" not in row:
                        row["event.kind"] = search_kind
                    if "signal.rule.name" in row:
                        row["rule.name"] = row.pop("signal.rule.name")
        return sorted(table_rows, key=lambda i: i["count"], reverse=True), 200


@ALERTS_NS.route("/remove")
class AlertsDelCtrl(Resource):
    @ALERTS_NS.doc(
        description="Remove alert object in elastic and hive with escalated or acknowledged status. \
                                The removed alert is put back into acknoweldge state and is also removed from hive."
    )
    @ALERTS_NS.response(500, "Error")
    @ALERTS_NS.response(200, "OK")
    @ALERTS_NS.expect(UpdateAlertsModel.DTO)
    def post(self) -> Response:
        indicies = ALL_INDEXES
        elastic = ElasticWrapper()
        payload = ALERTS_NS.payload
        acknowledged = "yes" if payload["form"]["acknowledged"] else "no"
        escalated = "yes" if payload["form"]["escalated"] else "no"
        start_time = payload["form"]["startDatetime"]
        end_time = payload["form"]["endDatetime"]
        show_closed = "yes" if payload["form"]["showClosed"] else "no"
        search_kind = "alert"
        if "event.kind" in payload:
            search_kind = payload["event.kind"]
        additional_must_clauses = get_additional_match_clauses(payload)
        body = {}
        body["query"] = build_query_clause(
            acknowledged=acknowledged,
            escalated=escalated,
            start_time=start_time,
            end_time=end_time,
            search_kind=search_kind,
            additional_must_clauses=additional_must_clauses,
            show_closed=show_closed,
        )
        body["size"] = 1
        body["_source"] = "event.hive_id"
        payload = elastic.search(
            body=body,
            index=indicies,
            doc_type=None,
            params=None,
            headers=None,
            request_timeout=ELASTIC_TIMEOUT,
        )
        hive_id = payload["hits"]["hits"][0]["_source"]["event"]["hive_id"]

        hive_srv = HiveService()
        hive_srv.delete_hive_case(hive_id)

        to_modify = {"query": {"match": {"event.hive_id": hive_id}}}

        if search_kind == "signal":
            to_modify["script"] = {
                "source": """
                    ctx._source.event.acknowledged = true;
                    ctx._source.event.escalated = false;
                    ctx._source.signal.status = "closed";
                    ctx._source.event.remove("hive_resolution_status");
                    ctx._source.event.remove("hive_status");
                    ctx._source.event.remove("hive_impact_status");
                    ctx._source.event.remove("hive_id");
                """,
                "lang": "painless",
            }
        else:
            to_modify["script"] = {
                "source": """
                    ctx._source.event.acknowledged = true;
                    ctx._source.event.escalated = false;
                    ctx._source.event.remove("hive_resolution_status");
                    ctx._source.event.remove("hive_status");
                    ctx._source.event.remove("hive_impact_status");
                    ctx._source.event.remove("hive_id");
                """,
                "lang": "painless",
            }

        ret_val = elastic.update_by_query(
            index=indicies, body=to_modify, request_timeout=ELASTIC_TIMEOUT
        )
        if ret_val and len(ret_val["failures"]) == 0:
            return ret_val, 200

        return ret_val, 500


@ALERTS_NS.route("/modify")
class AlertsAckCtrl(Resource):
    @ALERTS_NS.doc(
        description="Modify alert object in elastic with escalated or acknowledged status."
    )
    @ALERTS_NS.response(500, "Error")
    @ALERTS_NS.response(200, "OK")
    @ALERTS_NS.expect(UpdateAlertsModel.DTO)
    def post(self) -> Response:
        indicies = DEFAULT_INDEXES
        elastic = ElasticWrapper()
        payload = ALERTS_NS.payload
        perform_escalation = payload["form"]["performEscalation"]
        acknowledged = "yes" if payload["form"]["acknowledged"] else "no"
        escalated = "yes" if payload["form"]["escalated"] else "no"
        start_time = payload["form"]["startDatetime"]
        end_time = payload["form"]["endDatetime"]
        search_kind = "alert"
        if "event.kind" in payload:
            search_kind = payload["event.kind"]
        additional_must_clauses = get_additional_match_clauses(payload)
        body = {}
        body["query"] = build_query_clause(
            acknowledged=acknowledged,
            escalated=escalated,
            start_time=start_time,
            end_time=end_time,
            search_kind=search_kind,
            additional_must_clauses=additional_must_clauses,
        )

        hive_info = None
        if perform_escalation:
            try:
                hive_custom_fields = hive_custom_fields_to_create(payload)
                hive_srv = HiveService()
                hive_srv.create_custom_fields(hive_custom_fields)
                hive_info = hive_srv.create_hive_case(
                    payload["form"]["hiveForm"], hive_custom_fields
                )
            except HiveFailureError as e:
                return e.payload, 400

        if search_kind == "signal":
            indicies = SIGNAL_INDEX
            if perform_escalation:
                if escalated == "no":
                    hive_id = hive_info["_id"][1:]
                    body["script"] = {
                        "source": """
                            ctx._source.event.escalated = true;
                            ctx._source.event.hive_id = """
                        + hive_id
                        + """;
                            ctx._source.signal.status = "in-progress";
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )
            else:
                if acknowledged == "yes":
                    body["script"] = {
                        "source": """
                            ctx._source.event.acknowledged=false;
                            ctx._source.signal.status = "open";
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )
                elif acknowledged == "no":
                    body["script"] = {
                        "source": """
                            ctx._source.event.acknowledged=true;
                            ctx._source.signal.status = "closed";
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )
        else:
            # FOR ALERTS
            if perform_escalation:
                if escalated == "no":
                    hive_id = hive_info["_id"][1:]
                    body["script"] = {
                        "source": """
                            ctx._source.event.escalated = true;
                            ctx._source.event.hive_id = """
                        + hive_id
                        + """;
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )
            else:
                if acknowledged == "yes":
                    body["script"] = {
                        "source": """
                            ctx._source.event.acknowledged=false;
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )
                elif acknowledged == "no":
                    body["script"] = {
                        "source": """
                            ctx._source.event.acknowledged=true;
                        """,
                        "lang": "painless",
                    }
                    ret_val = elastic.update_by_query(
                        index=indicies, body=body, request_timeout=ELASTIC_TIMEOUT
                    )

        if ret_val and len(ret_val["failures"]) == 0:
            return ret_val, 200

        return ret_val, 500


@ALERTS_NS.route("/settings")
class HiveSettingsCtrl(Resource):
    @ALERTS_NS.doc(description="Save hive settings")
    @ALERTS_NS.response(400, "Error Model1", COMMON_ERROR_DTO1)
    @ALERTS_NS.response(200, "HiveSettings", HiveSettingsModel.DTO)
    @ALERTS_NS.expect(HiveSettingsModel.DTO)
    def post(self) -> Response:
        try:
            hive_settings = HiveSettingsModel.load_from_request(
                ALERTS_NS.payload)
            hive_settings.save_to_db()
            configure_webhook(hive_settings.admin_api_key)
            elastic = ElasticWrapper()
            elastic.indices.put_mapping({"dynamic": True}, index=SIGNAL_INDEX)
        except ValidationError as e:
            return e.normalized_messages(), 400
        except HiveFailureError as e:
            return e.payload, 400

        ret_val = hive_settings.to_dict()
        del ret_val["_id"]
        return ret_val

    @ALERTS_NS.response(200, "HiveSettings", HiveSettingsModel.DTO)
    def get(self) -> Response:
        try:
            ret_val = HiveSettingsModel.load_from_db().to_dict()
        except ValidationError:
            ret_val = HiveSettingsModel("").to_dict()

        del ret_val["_id"]
        return ret_val


def webhook():
    event = request.get_json()
    body = {}
    hive_id = int(event["objectId"][1:])
    hive_resolution_status = ""
    hive_impact_status = ""
    hive_status = ""
    event_kind = "alert"

    try:
        event_kind = (
            event["object"]["customFields"]["event.kind"]["string"]
            if event["object"]["customFields"]["event.kind"]["string"]
            else "alert"
        )
    except KeyError:
        pass

    try:
        hive_status = event["details"]["status"] if event["details"]["status"] else ""
    except KeyError:
        pass

    try:
        hive_impact_status = (
            event["details"]["impactStatus"] if event["details"]["impactStatus"] else ""
        )
    except KeyError:
        pass

    try:
        hive_resolution_status = (
            event["details"]["resolutionStatus"]
            if event["details"]["resolutionStatus"]
            else ""
        )
    except KeyError:
        pass

    body["query"] = {"match": {"event.hive_id": hive_id}}

    body["script"] = {
        "source": '''
            ctx._source.event.hive_resolution_status = "'''
        + hive_resolution_status
        + '''";
            ctx._source.event.hive_status = "'''
        + hive_status
        + '''";
            ctx._source.event.hive_impact_status = "'''
        + hive_impact_status
        + """";
        """,
        "lang": "painless",
    }

    if event["operation"] == "delete":
        body["script"] = {
            "source": """
                ctx._source.event.remove("hive_resolution_status");
                ctx._source.event.remove("hive_status");
                ctx._source.event.remove("hive_impact_status");
                ctx._source.event.remove("hive_id");
                ctx._source.event.escalated = false;
                ctx._source.event.acknowledged = true;
            """,
            "lang": "painless",
        }
        if event_kind == "signal":
            body["script"]["source"] += 'ctx._source.signal.status = "closed";\n'
    elif event_kind == "signal":
        if hive_status == "Resolved":
            body["script"]["source"] += 'ctx._source.signal.status = "closed"\n'
        else:
            body["script"]["source"] += 'ctx._source.signal.status = "in-progress"\n'

    elastic = ElasticWrapper()
    ret_val = elastic.update_by_query(
        index=ALL_INDEXES, body=body, request_timeout=ELASTIC_TIMEOUT
    )
    if ret_val and len(ret_val["failures"]) == 0:
        return ret_val

    return {}, 400


@HIVE_NS.route("/webhook")
class AlertWebhook(Resource):
    def get(self) -> Response:
        webhook()

    def post(self) -> Response:
        webhook()
