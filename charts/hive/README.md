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
      "name": "cortexIntegration"
    },
    {
      "type": "textinput",
      "default_value": "admin",
      "description": "Enter Superadmin Username",
      "required": true,
      "regexp": "",
      "name": "superadmin_username",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "default_value": "password!",
      "description": "Enter Superadmin Password",
      "required": true,
      "regexp": "",
      "name": "superadmin_password",
      "error_message": "Enter a value"
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
      "default_value": "password!",
      "description": "Enter Alert User Password",
      "required": true,
      "regexp": "",
      "name": "alert_user_password",
      "error_message": "Enter a value"
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
      "default_value": "password!",
      "description": "Enter User Password",
      "required": true,
      "regexp": "",
      "name": "read_write_user_password",
      "error_message": "Enter a value"
    },
    {
      "type": "checkbox",
      "default_value": true,
      "description": "Integrate with MISP (Requires MISP to be installed first, verify MISP is up and running before continuing)",
      "trueValue": true,
      "falseValue": false,
      "name": "mispIntegration"
    },
    {
      "type": "textinput",
      "default_value": "<Template_Name_goes_here>",
      "description": "Enter MISP Case Template Name",
      "required": true,
      "regexp": "",
      "name": "case_template",
      "error_message": "Enter a value"
    },
    {
      "type": "invisible",
      "name": "affinity_hostname"
    },
    {
      "type": "invisible",
      "name": "node_hostname"
    }
  ]
}