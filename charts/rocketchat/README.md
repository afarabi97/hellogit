---
id: RocketChat
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
  default_value: admin@dip.local
  description: Enter RocketChat Admin email.
  required: true
  regexp: ^[A-Za-z][A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
  name: admin_email
  error_message: Please enter a valid email address.  It must conform to something@gmail.com.
- type: textinput
  default_value: Password!123456
  description: Enter RocketChat Admin password (min 8 characters)
  required: true
  regexp: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\d!@#$%^&*()<>.?]{15,}$
  name: admin_pass
  error_message: >
    Please enter a vaild password it must have a minimum of fifteen characters,
    at least one uppercase letter, one lowercase letter, one number and one special
    character.  Valid special characters !@#$%^&*()<>.?).
- type: textinput
  default_value: admin
  description: Enter RocketChat Admin username
  required: true
  regexp: ''
  name: admin_user
  error_message: Enter a value
- type: invisible
  name: node_hostname
