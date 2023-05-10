from ipaddress import IPv4Address


mock_mip_schema_1 = {"hostname": "miper", "ip_address": "10.40.20.4",
                     "mac_address": None, "deployment_type": "Virtual",
                     "virtual_cpu": 8, "virtual_mem": 8, "virtual_os": 500}
mock_mip_schema_2 = {"hostname": "miperest"}


class MipSchemaDBModel():
    hostname = "miper"
    ip_address = IPv4Address("10.40.20.4")
    mac_address = None
    deployment_type = "Virtual"
    virtual_cpu = 8
    virtual_mem = 8
    virtual_os = 500
    _id = "1"