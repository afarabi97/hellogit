{
  "id": "MISP",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
    {
      "type": "textinput",
      "default_value": "1qaz@WSX1qaz@WSX",
      "description": "Enter admin password (min 10 characters, 1 upper, 1 number, 1 special character)",
      "required": true,
      "regexp": "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{10,}$",
      "name": "admin_pass",
      "error_message": "Enter a value"
    },
    {
      "type": "textinput",
      "default_value": "CPT HUNT",
      "description": "Enter Default Organization Name. Recommend making it unique if connected to a GIP or other DIPs",
      "required": true,
      "regexp": "",
      "name": "org_name",
      "error_message": "Enter a value"
    },
    {
        "type": "cortex-checkbox",
        "default_value": false,
        "description": "Integrate with Cortex (Requires Cortex to be installed first, verify Cortex is up and running before continuing)",
        "trueValue": true,
        "falseValue": false,
        "name": "cortexIntegration"
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
