import datetime
import socket

from app.utils.elastic import ElasticWrapper

SNMP_QUERY = {
    "query": {
        "bool": {
            "filter": [
                {"term": {"type": "snmp"}},
                {"range": {"@timestamp": {"gte": "now-1m"}}},
            ]
        }
    },
    "collapse": {"field": "host.keyword"},
    "sort": [{"@timestamp": {"order": "desc"}}],
}


def status():
    client = ElasticWrapper()
    index = client.indices.exists(index="snmp-data")
    if index:
        response = client.search(SNMP_QUERY, "snmp-data", size=50)
        return sorted(
            filter(
                lambda y: y,
                map(lambda x: transform(x["_source"]),
                    response["hits"]["hits"]),
            ),
            key=lambda z: socket.inet_aton(z["host"]),
        )
    return []


def transform(data):
    functions = {
        "brocade": brocade,
        "cisco_asa": cisco_asa,
        "cisco_switch": cisco_switch,
        "dell_m630": dell_m630,
        "dell_san": dell_san,
        "dell_4112": dell_4112,
    }

    function = functions.get(data["deviceType"])
    if function:
        return function(data)

    return None


def physical_disk_table_row(data):
    return {
        "diskState": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.4"
        ],
        "capacity": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.11"
        ],
        "usedSpace": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.17"
        ],
        "freeSpace": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.19"
        ],
        "mediaType": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.35"
        ],
        "displayName": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.5.1.20.130.4.1.55"
        ],
        "index": data["index"],
    }


def memory_device_table_row(data):
    return {
        "status": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.50.1.5"
        ],
        "size": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.50.1.14"
        ],
        "index": data["index"],
    }


def processor_device_table_row(data):
    return {
        "status": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.5"
        ],
        "maximumSpeed": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.11"
        ],
        "currentSpeed": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.12"
        ],
        "coreCount": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.17"
        ],
        "threadCount": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.19"
        ],
        "brandName": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.1100.30.1.23"
        ],
        "index": data["index"],
    }


def temperature_probe_table_row(data):
    return {
        "reading": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.700.20.1.6"
        ],
        "locationName": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.4.700.20.1.8"
        ],
        "index": data["index"],
    }


def if_table_row(data):
    result = {
        "description": data[
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifDescr"
        ],
        "speed": data[
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifSpeed"
        ],
        "adminStatus": ("", "up", "down", "testing")[
            data[
                "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifAdminStatus"
            ]
        ],
        "operStatus": (
            "",
            "up",
            "down",
            "testing",
            "unknown",
            "dormant",
            "notPresent",
            "lowerLayerDown",
        )[
            data[
                "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifOperStatus"
            ]
        ],
        "index": data["index"],
    }
    if (
        data.get(
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifInDiscards"
        )
        != None
    ):
        result["inDiscards"] = data[
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifInDiscards"
        ]
    if (
        data.get(
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifOutDiscards"
        )
        != None
    ):
        result["outDiscards"] = data[
            "iso.org.dod.internet.mgmt.mib-2.interfaces.ifTable.ifEntry.ifOutDiscards"
        ]
    return result


def csw_switch_info_table_row(data):
    return {
        "state": data["iso.org.dod.internet.private.enterprises.9.9.500.1.2.1.1.6"],
        "index": data["index"],
    }


def sw_sensor_table_row(data):
    return {
        "type": data["iso.org.dod.internet.private.enterprises.1588.2.1.1.1.1.22.1.2"],
        "status": data[
            "iso.org.dod.internet.private.enterprises.1588.2.1.1.1.1.22.1.3"
        ],
        "value": data["iso.org.dod.internet.private.enterprises.1588.2.1.1.1.1.22.1.4"],
        "info": data["iso.org.dod.internet.private.enterprises.1588.2.1.1.1.1.22.1.5"],
        "index": data["index"],
    }


def cpm_cpu_total_table_row(data):
    return {
        "cpuUsage": data["iso.org.dod.internet.private.enterprises.9.9.109.1.1.1.1.8"],
        "index": data["index"],
    }


def sensor(entity, sensor):
    return {
        "type": sensor[
            "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorType"
        ],
        "scale": sensor[
            "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorScale"
        ],
        "precision": sensor[
            "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorPrecision"
        ],
        "value": sensor[
            "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorValue"
        ],
        "unitsDisplay": sensor[
            "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorUnitsDisplay"
        ],
        "operStatus": ("", "ok", "unavailable", "nonoperational")[
            sensor[
                "iso.org.dod.internet.mgmt.mib-2.entitySensorMIB.entitySensorObjects.entPhySensorTable.entPhySensorEntry.entPhySensorOperStatus"
            ]
        ],
        "description": entity[
            "iso.org.dod.internet.mgmt.mib-2.entityMIB.entityMIBObjects.entityPhysical.entPhysicalTable.entPhysicalEntry.entPhysicalDescr"
        ],
        "index": sensor["index"],
    }


def cisco_env_mon_fan_status_table_row(data):
    return {
        "description": data["iso.org.dod.internet.private.enterprises.9.9.13.1.4.1.2"],
        "value": (
            "",
            "normal",
            "warning",
            "critical",
            "shutdown",
            "notPresent",
            "notFunctioning",
        )[data["iso.org.dod.internet.private.enterprises.9.9.13.1.4.1.3"]],
        "index": data["index"],
    }


def cisco_env_mon_temperature_status_table_row(data):
    return {
        "description": data["iso.org.dod.internet.private.enterprises.9.9.13.1.3.1.3"],
        "value": data["iso.org.dod.internet.private.enterprises.9.9.13.1.3.1.2"],
        "index": data["index"],
    }


def sc_ctlr_fan_table_row(data):
    return {
        "status": ("", "up", "down", "degraded")[
            data[
                "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.16.1.3"
            ]
        ],
        "name": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.16.1.4"
        ],
        "currentRpm": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.16.1.5"
        ],
        "index": data["index"],
    }


def sc_ctrl_temp_table_row(data):
    return {
        "status": ("", "up", "down", "degraded")[
            data[
                "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.19.1.3"
            ]
        ],
        "name": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.19.1.4"
        ],
        "currentC": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.19.1.5"
        ],
        "warnLwrC": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.19.1.8"
        ],
        "warnUprC": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.19.1.9"
        ],
        "index": data["index"],
    }


def sc_encl_temp_table_row(data):
    return {
        "status": ("", "up", "down", "degraded")[
            data[
                "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.23.1.3"
            ]
        ],
        "location": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.23.1.4"
        ],
        "currentC": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.23.1.5"
        ],
        "index": data["index"],
    }


def brocade(data):
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "description": data["iso.org.dod.internet.mgmt.mib-2.system.sysDescr.0"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "hostname": data["iso.org.dod.internet.mgmt.mib-2.system.sysName.0"],
        "inReceives": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInReceives.0"],
        "inDelivers": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInDelivers.0"],
        "cpuUsage": data[
            "iso.org.dod.internet.private.enterprises.1588.2.1.1.1.26.1.0"
        ],
        "memUsage": data[
            "iso.org.dod.internet.private.enterprises.1588.2.1.1.1.26.6.0"
        ],
        "interfaces": list(map(lambda x: if_table_row(x), data["ifTable"])),
        "sensors": list(map(lambda x: sw_sensor_table_row(x), data["swSensorTable"])),
    }


def cisco_asa(data):
    entities = [
        x
        for x in data["entPhysicalTable"]
        if x[
            "iso.org.dod.internet.mgmt.mib-2.entityMIB.entityMIBObjects.entityPhysical.entPhysicalTable.entPhysicalEntry.entPhysicalClass"
        ]
        == 8
    ]
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "description": data["iso.org.dod.internet.mgmt.mib-2.system.sysDescr.0"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "hostname": data["iso.org.dod.internet.mgmt.mib-2.system.sysName.0"],
        "processrMemoryUsed": data[
            "iso.org.dod.internet.private.enterprises.9.9.48.1.1.1.5.1"
        ],
        "processMemoryFree": data[
            "iso.org.dod.internet.private.enterprises.9.9.48.1.1.1.6.1"
        ],
        "interfaces": list(map(lambda x: if_table_row(x), data["ifTable"])),
        "cpu": list(
            map(lambda x: cpm_cpu_total_table_row(x), data["cpmCPUTotalTable"])
        ),
        "sensors": list(
            map(
                lambda x: sensor(entities[x[0]], x[1]),
                enumerate(data["entPhySensorTable"]),
            )
        ),
    }


def cisco_switch(data):
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "description": data["iso.org.dod.internet.mgmt.mib-2.system.sysDescr.0"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "inReceives": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInReceives.0"],
        "inDelivers": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInDelivers.0"],
        "hostname": data["iso.org.dod.internet.private.enterprises.9.2.1.3.0"],
        "processrMemoryUsed": data[
            "iso.org.dod.internet.private.enterprises.9.9.48.1.1.1.5.1"
        ],
        "processMemoryFree": data[
            "iso.org.dod.internet.private.enterprises.9.9.48.1.1.1.6.1"
        ],
        "cpuUtilization": data[
            "iso.org.dod.internet.private.enterprises.9.9.109.1.1.1.1.6.1"
        ],
        "interfaces": list(map(lambda x: if_table_row(x), data["ifTable"])),
        "switchInfo": list(
            map(lambda x: csw_switch_info_table_row(
                x), data["cswSwitchInfoTable"])
        ),
        "fans": list(
            map(
                lambda x: cisco_env_mon_fan_status_table_row(x),
                data["ciscoEnvMonFanStatusTable"],
            )
        ),
        "temperature": list(
            map(
                lambda x: cisco_env_mon_temperature_status_table_row(x),
                data["ciscoEnvMonTemperatureStatusTable"],
            )
        ),
    }


def dell_m630(data):
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "hostname": data["iso.org.dod.internet.mgmt.mib-2.system.sysName.0"],
        "inReceives": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInReceives.0"],
        "inDelivers": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInDelivers.0"],
        "powerUpTime": data[
            "iso.org.dod.internet.private.enterprises.674.10892.5.2.5.0"
        ],
        "processors": list(
            map(lambda x: processor_device_table_row(
                x), data["processorDeviceTable"])
        ),
        "memory": list(
            map(lambda x: memory_device_table_row(
                x), data["memoryDeviceTable"])
        ),
        "disks": list(
            map(lambda x: physical_disk_table_row(
                x), data["physicalDiskTable"])
        ),
        "temperature": list(
            map(lambda x: temperature_probe_table_row(
                x), data["temperatureProbeTable"])
        ),
        "interfaces": list(map(lambda x: if_table_row(x), data["ifTable"])),
    }


def dell_san(data):
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "inReceives": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInReceives.0"],
        "inDelivers": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInDelivers.0"],
        "description": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.1.0"
        ],
        "hostname": data[
            "iso.org.dod.internet.private.enterprises.674.11000.2000.500.1.2.29.1.4.1"
        ],
        "enclTemp": list(
            map(lambda x: sc_encl_temp_table_row(x), data["scEnclTempTable"])
        ),
        "ctlrFan": list(
            map(lambda x: sc_ctlr_fan_table_row(x), data["scCtlrFanTable"])
        ),
        "ctlrTemp": list(
            map(lambda x: sc_ctrl_temp_table_row(x), data["scCtlrTempTable"])
        ),
    }


def dell_4112(data):
    return {
        "host": data["host"],
        "deviceType": data["deviceType"],
        "description": data["iso.org.dod.internet.mgmt.mib-2.system.sysDescr.0"],
        "upTime": str(
            datetime.timedelta(
                milliseconds=(
                    data[
                        "iso.org.dod.internet.mgmt.mib-2.system.sysUpTime.sysUpTimeInstance"
                    ]
                    * 10
                )
            )
        ),
        "hostname": data["iso.org.dod.internet.mgmt.mib-2.system.sysName.0"],
        "inReceives": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInReceives.0"],
        "inDelivers": data["iso.org.dod.internet.mgmt.mib-2.ip.ipInDelivers.0"],
        "interfaces": list(map(lambda x: if_table_row(x), data["ifTable"])),
    }
