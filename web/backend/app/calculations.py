from typing import List, Tuple

from app.utils.constants import NODE_TYPES


def get_servers_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if (
            node["node_type"] == NODE_TYPES.server.value
            or node["node_type"] == NODE_TYPES.service_node.value
        ):
            ret_val.append(node)
    return ret_val


def get_sensors_from_list(nodes: List) -> List:
    ret_val = []
    for node in nodes:
        if node["node_type"] == NODE_TYPES.sensor.value:
            ret_val.append(node)
    return ret_val


def server_and_sensor_count(nodes: List) -> Tuple[int, int]:
    server_count = 0
    sensor_count = 0
    control_plane_count = 0
    for node in nodes:
        if (
            node["node_type"] == NODE_TYPES.server.value
            or node["node_type"] == NODE_TYPES.service_node.value
        ):
            server_count += 1
        elif node["node_type"] == NODE_TYPES.sensor.value:
            sensor_count += 1
        elif node["node_type"] == NODE_TYPES.control_plane.value:
            control_plane_count += 1
    return server_count, sensor_count, control_plane_count
