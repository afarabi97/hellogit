import psutil

class PsutilMetrics():
    def __init__(self, hostname):
        self._hostname = hostname

    def _create_metric(self, name, value, etype, hostname=None):
        data = {
          "name": name,
          "value": value,
          "type": etype,
          "hostname": hostname if hostname else self._hostname,
        }
        return data

    def _virtual_memory(self):
        return self._create_metric("memory", dict(psutil.virtual_memory()._asdict()), "psutil")

    def _root_disk_usage(self):
        return self._create_metric("root_usage", dict(psutil.disk_usage('/')._asdict()), "psutil")

    def _data_disk_usage(self):
        return self._create_metric("data_usage", dict(psutil.disk_usage('/data')._asdict()), "psutil")

    def _cpu_percent(self):
        return self._create_metric("cpu_percent", psutil.cpu_percent(interval=3), "psutil")

    def get_metrics(self):
        data = []
        data.append(self._virtual_memory())
        data.append(self._root_disk_usage())
        data.append(self._data_disk_usage())
        data.append(self._cpu_percent())
        return data
