{
  "id": "HIVE",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
    {
      "type": "checkbox",
      "default_value": true,
      "description": "Integrate with Cortex (Requires Cortex to be installed first, verify Cortex is up and running before continuing)",
      "trueValue": true,
      "falseValue": false,
      "name": "cortexIntegration",
      "dependent_app": "cortex"
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
      "default_value": "user@thehive.local",
      "description": "Enter Username",
      "required": true,
      "regexp": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
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
      "type": "textinput",
      "default_value": "org_admin@thehive.local",
      "description": "Enter Username",
      "required": true,
      "regexp": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
      "name": "org_admin_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "default_value": "Password!123456",
      "description": "Enter User Password",
      "required": true,
      "regexp": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$",
      "name": "org_admin_password",
      "error_message": "Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?)."
    },
    {
      "type": "checkbox",
      "default_value": true,
      "description": "Integrate with MISP (Requires MISP to be installed first, verify MISP is up and running before continuing)",
      "trueValue": true,
      "falseValue": false,
      "name": "mispIntegration",
      "dependent_app": "misp"
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
