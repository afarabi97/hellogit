from datetime import datetime, timezone
import aniso8601
from pathlib import Path

class ElasticsearchMetrics():
    _type = "elastic"

    def __init__(self, node, hostname, shortHostname, elasticsearch):
        self._node = node

        self._zeek_query = 'observer.hostname:{} AND event.module:zeek'.format(hostname)
        self._suricata_query = 'observer.hostname:"{}" AND event.module:suricata'.format(hostname)
        self._moloch_query = 'node:{}'.format(shortHostname)

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

    def _createQuery(self, query, field):
        return \
        {
            "size": 1,
            "_source": field,
            "sort": [{field: "desc"}],
            "query": {
                "query_string" : {
                    "query" : query
                }
            }
        }

    def _lastZeekElasticEvents(self):
        index = 'filebeat-*'
        query = self._zeek_query
        body = self._createQuery(query=query, field='@timestamp')

        name = 'last_zeek_elastic_events'

        try:
            result = self._elasticsearch.search(index, body)
            timestamp = result['hits']['hits'][0]['_source']['@timestamp']
            date = aniso8601.parse_datetime(timestamp)
            value = date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return None
        else:
            return self._createMetric(name, value)

    def _lastSuricataElasticEvents(self):
        index = 'filebeat-*'
        query = self._suricata_query
        body = self._createQuery(query=query, field='@timestamp')

        name = 'last_suricata_elastic_events'

        try:
            result = self._elasticsearch.search(index, body)
            timestamp = result['hits']['hits'][0]['_source']['@timestamp']
            date = aniso8601.parse_datetime(timestamp)
            value = date.strftime('%Y-%m-%d %H:%M:%S %z')
        except IndexError:
            return None
        else:
            return self._createMetric(name, value)

    def _lastMolochElasticEvents(self):
        index = 'sessions2*'
        query = self._moloch_query
        body = self._createQuery(query=query, field='timestamp')

        name = 'last_moloch_elastic_events'

        try:
            result = self._elasticsearch.search(index, body)
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

        moloch = self._lastMolochElasticEvents()
        if (moloch):
            data.append(moloch)

        return data
