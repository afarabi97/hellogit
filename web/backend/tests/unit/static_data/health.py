nodes_and_pods = [
    {
        "node_name": "sensor1.deadshot", "pod_name": "sensor1-suricata-6468b98ddf-dw8bh"
    },
    {
        "node_name": "sensor2.deadshot", "pod_name": "sensor2-suricata-6977569987-hndcm"
    },
    {
        "node_name": "sensor3.deadshot", "pod_name": "sensor3-suricata-67b595dd89-4crtx"
    },
    {
        "node_name": "sensor4.deadshot", "pod_name": "sensor4-suricata-596dc484cf-t8d89"
    }
]

zeek_stats = {
    "hits": {
        "total": {
            "value": 5523,
        },
    },
    "aggregations": {
        "zeek_total_pkts_dropped": {
            "value": 0.0
        },
        "zeek_total_pkts_received": {
            "value": 0.0
        },
    }
}
