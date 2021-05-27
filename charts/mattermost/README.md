{
  "id": "mattermost",
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
      "default_value": "local_admin@dip.local",
      "description": "Enter Mattermost Admin email.",
      "required": true,
      "regexp": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      "name": "admin_email",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "description": "Enter Mattermost Admin password.",
      "required": true,
      "name": "admin_pass",
      "default_value": "Password!123456",
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",      
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "textinput",
      "default_value": "local_admin",
      "description": "Enter Mattermost Admin username",
      "required": true,
      "regexp": "",
      "name": "admin_user",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "default_value": "CPT",
      "description": "Enter Mattermost Team Name",
      "required": true,
      "regexp": "",
      "name": "team_name",
      "error_message": "Enter a value"
    },
    {
      "type": "invisible",
      "name": "node_hostname"
    }
  ]

}
