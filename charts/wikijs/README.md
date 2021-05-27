{
  "id": "wikijs",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
    {
      "type": "service-node-checkbox",
      "default_value": false,
      "description": "Install App on Service Node",
      "trueValue": true,
      "falseValue": false,
      "name": "serviceNode"
    },
    {
      "type": "textinput",
      "default_value": "admin@dip.local",
      "description": "Enter Wiki Admin email.",
      "required": true,
      "regexp": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      "name": "admin_email",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "description": "Enter Wiki Admin password.",
      "required": true,
      "name": "admin_pass",
      "default_value": "Password!123456",
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "invisible",
      "name": "node_hostname"
    }
  ]
}
