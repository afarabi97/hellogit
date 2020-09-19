from typing import List, Tuple
from app.utils.constants import NODE_TYPES


def get_servers_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if node["node_type"] == NODE_TYPES[0]:
            ret_val.append(node)
    return ret_val


def get_sensors_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if node["node_type"] == NODE_TYPES[1]:
            ret_val.append(node)
    return ret_val


def server_and_sensor_count(nodes: List) -> Tuple[int, int]:
    server_count = 0
    sensor_count = 0
    for node in nodes:
        if node["node_type"] == NODE_TYPES[0]:
            server_count += 1
        elif node["node_type"] == NODE_TYPES[1]:
            sensor_count += 1
    return server_count, sensor_count
