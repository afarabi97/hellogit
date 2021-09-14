---
id: netflow-filebeat
type: chart
node_affinity: Server - Any
formControls:
- type: service-node-checkbox
  default_value: false
  description: Install App on Service Node
  trueValue: true
  falseValue: false
  name: serviceNode
- type: invisible
  name: node_hostname
- type: textinputlist
  default_value: '["192.168.0.0/24"]'
  description: Enter your home/defended network in this format ["home network IP 1"," home network IP 2"] or ["any"]
  required: true
  regexp: ^\[\s*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))"\s*,\s*)*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))")\s*\]$
  name: home_net
  error_message: Enter a valid IP or 'any'

