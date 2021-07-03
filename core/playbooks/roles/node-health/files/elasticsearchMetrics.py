from datetime import datetime, timezone
import aniso8601
from pathlib import Path
from typing import List


class ElasticsearchMetrics():
    _type = "elastic"

    def __init__(self, node, hostname, shortHostname, elasticsearch):
        self._node = node
        self._hostname = hostname
        self._shortname = shortHostname
        self._elasticsearch = elasticsearch

    def _createMetric(self, name, value):
        data = {
          "node": self._node,
          "name": name,
          "type": self._type,
          "value": value
        }

        return data

    def _lastLogEvent(self, logs):
        if (logs):
            logs.sort(key=lambda x: x.stat().st_mtime, reverse = True)
            mtime = logs[0].stat().st_mtime
            date = datetime.fromtimestamp(mtime, tz=timezone.utc)
            return date.strftime('%Y-%m-%d %H:%M:%S %z')
        else:
            return None

    def _lastZeekLogEvent(self):
        zeek = Path('/data/zeek')
        logs = list(zeek.glob('**/conn*.log'))

        name = "last_zeek_log_event"
        value = self._lastLogEvent(logs)

        return self._createMetric(name, value)

    def _lastSuricataLogEvent(self):
        suricata = Path('/data/suricata')
        logs = list(suricata.glob('eve*.json'))

        name = "last_suricata_log_event"
        value = self._lastLogEvent(logs)

        return self._createMetric(name, value)


    def _lastPCAPLogEvent(self):
        pcap = Path('/data/pcap')
        logs = list(pcap.glob('*.pcap'))

        name = "last_pcap_log_event"
        value = self._lastLogEvent(logs)

        return self._createMetric(name, value)

    def _createMatchClause(self, key: str, value: str):
        return \
        {
            "match": {
                key: value
            }
        }

    def _createQuery(self, must: List, sort_by: str='@timestamp'):
        return \
        {
            "size": 1,
            "_source": sort_by,
            "sort": [
                {
                    sort_by: "desc"
                }
            ],
            "query": {
                "bool": {
                    "must": must
                }
            }
        }

    def _lastZeekElasticEvents(self):
        index = 'filebeat-*'
        match1 = self._createMatchClause('observer.hostname', self._hostname)
        match2 = self._createMatchClause('event.module', 'zeek')
        body = self._createQuery([match1, match2])

        name = 'last_zeek_elastic_events'

        try:
            result = self._elasticsearch.search(index=index, body=body)
            timestamp = result['hits']['hits'][0]['_source']['@timestamp']
            date = aniso8601.parse_datetime(timestamp)
            value = date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return None
        else:
            return self._createMetric(name, value)

    def _lastSuricataElasticEvents(self):
        index = 'filebeat-*'
        match1 = self._createMatchClause('observer.hostname', self._hostname)
        match2 = self._createMatchClause('event.module', 'suricata')
        body = self._createQuery([match1, match2])

        name = 'last_suricata_elastic_events'

        try:
            result = self._elasticsearch.search(index=index, body=body)
            timestamp = result['hits']['hits'][0]['_source']['@timestamp']
            date = aniso8601.parse_datetime(timestamp)
            value = date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return None
        else:
            return self._createMetric(name, value)

    def _lastArkimeElasticEvents(self):
        index = 'sessions2*'
        match1 = self._createMatchClause('node', self._shortname)
        body = self._createQuery([match1], 'timestamp')

        name = 'last_arkime_elastic_events'

        try:
            result = self._elasticsearch.search(index=index, body=body)
            timestamp = result['hits']['hits'][0]['_source']['timestamp']

            date = datetime.fromtimestamp(timestamp/1000, tz=timezone.utc)
            value = date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return None
        else:
            return self._createMetric(name, value)

    def getMetrics(self):
        data = []

        data.append(self._lastZeekLogEvent())
        data.append(self._lastSuricataLogEvent())
        data.append(self._lastPCAPLogEvent())

        zeek = self._lastZeekElasticEvents()
        if (zeek):
            data.append(zeek)

        suricata = self._lastSuricataElasticEvents()
        if (suricata):
            data.append(suricata)

        arkime = self._lastArkimeElasticEvents()
        if (arkime):
            data.append(arkime)

        return data
