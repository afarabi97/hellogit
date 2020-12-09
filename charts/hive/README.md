{
  "id": "HIVE",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
    {
      "type": "cortex-checkbox",
      "default_value": false,
      "description": "Integrate with Cortex (Requires Cortex to be installed first, verify Cortex is up and running before continuing)",
      "trueValue": true,
      "falseValue": false,
      "name": "cortexIntegration"
    },
    {
      "type": "textinput",
      "default_value": "hive_admin",
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
      "default_value": "alert_user",
      "description": "Enter Alert Username",
      "required": true,
      "regexp": "",
      "name": "alert_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "description": "Enter Alert User Password",
      "required": true,      
      "name": "alert_user_password",      
      "default_value": "Password!123456",
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",      
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "textinput",
      "default_value": "user",
      "description": "Enter Username",
      "required": true,
      "regexp": "",
      "name": "read_write_user_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "description": "Enter User Password",
      "required": true,      
      "name": "read_write_user_password",      
      "default_value": "Password!123456",
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",      
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "misp-checkbox",
      "default_value": false,
      "description": "Integrate with MISP (Requires MISP to be installed first, verify MISP is up and running before continuing)",
      "trueValue": true,
      "falseValue": false,
      "name": "mispIntegration"
    },
    {
      "type": "textinput",
      "default_value": "MISP",
      "description": "Enter MISP Case Template Name",
      "required": true,
      "regexp": "",
      "name": "case_template",
      "error_message": "Enter a value"
    },
    {
      "type": "invisible",
      "name": "node_hostname"
    }
  ]
}
