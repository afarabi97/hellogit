---
id: MISP
type: chart
node_affinity: Server - Any
formControls:
- type: service-node-checkbox
  default_value: false
  description: Install App on Service Node
  trueValue: true
  falseValue: false
  name: serviceNode
- type: textinput
  default_value: CPT HUNT
  description: >
    Enter Default Organization Name. Recommend making it unique if connected
    to a GIP or other DIPs
  required: true
  regexp: ''
  name: org_name
  error_message: Enter a value
- type: checkbox
  default_value: true
  description: >
    Integrate with Cortex (Requires Cortex to be installed first, verify
    Cortex is up and running before continuing)
  trueValue: true
  falseValue: false
  name: cortexIntegration
  dependent_app: cortex
- type: invisible
  name: node_hostname
