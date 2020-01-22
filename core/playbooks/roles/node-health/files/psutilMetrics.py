import psutil

class PsutilMetrics():
    _type = 'psutil'

    def __init__(self, node):
        self._node = node
    
    def _createMetric(self, name, value):
        data = {
          "node": self._node,
          "name": name,
          "type": self._type,
          "value": value
        }

        return data

    def _virtualMemory(self):
        name = "memory"
        value = list(psutil.virtual_memory())

        return self._createMetric(name, value)

    def _rootDiskUsage(self):
        name = "root_usage"
        value = list(psutil.disk_usage('/'))

        return self._createMetric(name, value)

    def _dataDiskUsage(self):
        name = "data_usage"
        value = list(psutil.disk_usage('/data'))

        return self._createMetric(name, value)

    def _cpuPercent(self):
        name = "cpu_percent"
        value = psutil.cpu_percent()

        return self._createMetric(name, value)

    def getMetrics(self):
        data = []
        data.append(self._virtualMemory())
        data.append(self._rootDiskUsage())
        data.append(self._dataDiskUsage())
        data.append(self._cpuPercent())
        
        return data
