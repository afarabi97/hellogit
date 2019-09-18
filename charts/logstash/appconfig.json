{
    "id": "Logstash",
    "type": "chart",
    "node_affinity": "Server - Any",
    "devDependent": "zeek",
    "formControls": [
        {
          "type": "textinput",
          "default_value": "4",
          "description": "Enter how many logstash replicas to run",
          "required": true,
          "regexp": "^\\d+$",
          "name": "replicas",
          "error_message": "Enter valid number"
        },
        {
          "type": "textinput",
          "default_value": "12",
          "description": "Enter how much memory to give each replica, in GB",
          "required": true,
          "regexp": "^\\d+$",
          "name": "heap_size",
          "error_message": "Enter valid number"
        },
        {
          "type": "invisible",
          "name": "node_hostname"
        },
        {
          "type": "kafka-cluster-cluster",
          "default_value": "",
          "description": "This is a list of kafka cluster to pass to logstash, only edit if you know what your doing",
          "required": true,
          "regexp": "",
          "name": "kafka_clusters",
          "error_message": "This is not valid"
        }
    ]
}
