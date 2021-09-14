---
id: remote-health-agent
type: chart
node_affinity: Server - Any
formControls:
- type: textinput
  default_value: ''
  description: Enter director IP Address
  required: true
  name: director_ipaddress
  regexp: ^(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])$
- type: textbox
  default_value: ''
  description: Enter token generated on director
  required: true
  name: director_token
  regexp: ''
- type: textbox
  default_value: ''
  description: Enter webca obtained from the director
  required: true
  name: director_webca
  regexp: ^-{5}BEGIN CERTIFICATE-{5}\s+([^-]+)-{5}END CERTIFICATE-{5}$
- type: invisible
  name: node_hostname

