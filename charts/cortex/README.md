{
  "id": "Cortex",
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
      "default_value": "cortex_admin",
      "description": "Enter Superadmin Username",
      "required": true,
      "regexp": "",
      "name": "superadmin_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",      
      "description": "Enter Superadmin Password",
      "required": true,      
      "name": "superadmin_password",
      "default_value": "Password!123456",
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",      
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "textinput",
      "default_value": "thehive",
      "description": "Enter an Organization Name",
      "required": true,
      "regexp": "",
      "name": "org_name",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "default_value": "admin_thehive",
      "description": "Enter Org Admin Username",
      "required": true,
      "regexp": "",
      "name": "org_admin_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",      
      "description": "Enter Admin Password",
      "required": true,
      "name": "org_admin_password",
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
