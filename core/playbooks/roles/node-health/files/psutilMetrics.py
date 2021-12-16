import psutil

class PsutilMetrics():
    def __init__(self, hostname, disk_pressure_warning, disk_pressure_critical):
        self._hostname = hostname
        self.disk_pressure_warning = disk_pressure_warning
        self.disk_pressure_critical = disk_pressure_critical

    def _create_metric(self, name, value, etype, hostname=None):
        data = {
          "name": name,
          "value": value,
          "type": etype,
          "hostname": hostname if hostname else self._hostname,
        }
        if name == "data_usage" or name == "root_usage":
            data["disk_pressure_warning"] = False
            if int(value["percent"]) >= int(self.disk_pressure_warning):
                data["disk_pressure_warning"] = True
            if int(value["percent"]) >= int(self.disk_pressure_critical):
                data["disk_pressure_critical"] = True
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
