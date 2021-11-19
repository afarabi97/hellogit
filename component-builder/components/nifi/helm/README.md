---
id: NiFi
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

