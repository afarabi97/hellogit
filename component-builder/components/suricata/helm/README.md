---
id: suricata
type: chart
node_affinity: Sensor
formControls:
- type: checkbox
  default_value: false
  description: Enable writing PCAPs (do not enable this and Arkime PCAP at the same time)
  trueValue: true
  falseValue: false
  name: pcapEnabled
- type: checkbox
  default_value: false
  description: >
    Send to logstash instead of directly to Elasticsearch (Requires Logstash
    to be installed first, verify Logstash is up and running before continuing)
  trueValue: true
  falseValue: false
  name: use_logstash
  dependent_app: logstash
- type: textinputlist
  default_value: '["192.168.0.0/24"]'
  description: Enter your home/defended network in this format ["home network IP 1"," home network IP 2"] or ["any"]
  required: true
  regexp: ^\[\s*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))"\s*,\s*)*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))")\s*\]$
  name: home_net
  error_message: 'Enter a valid IP in a bracket array (EX: ["192.168.0.0/24"] or ["any"]) with the brackets.'
- type: textinputlist
  default_value: ''
  description: >
    Enter your external/untrusted network (defaults to !home_net) ["external network IP 1", " external network IP 2"] or ["any"]
  required: false
  regexp: ^(\s*|\[\s*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))"\s*,\s*)*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))")\s*\])$
  name: external_net
  error_message: 'Enter a valid IP in a bracket array (EX: ["192.168.0.0/24"] or ["any"]) with the brackets.'
- type: interface
  default_value: ''
  description: Select the interfaces to listen on
  required: true
  regexp: ''
  name: interfaces
  error_message: Select one or more interfaces
- type: textinput
  default_value: '8'
  description: Enter the number of Suricata threads per interface
  required: true
  regexp: ^\d+$
  name: suricata_threads
  error_message: Enter a valid number
- type: invisible
  name: affinity_hostname
- type: invisible
  name: node_hostname
- type: suricata-list
  default_value:
  - alert
  - http
  - dns
  - tls
  - flow
  - other
  description: List of Suricata log types. Uncheck any that are not needed.
  required: true
  regexp: ''
  name: log_types
  error_message: Please select a log type
