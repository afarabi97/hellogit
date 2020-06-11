{
  "id": "MISP",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
    {
      "type": "textinput",
      "default_value": "hive@dip.local",
      "description": "Enter MISP User email for The HIVE",
      "required": true,
      "regexp": "",
      "name": "hive_user_email",
      "error_message": "Enter a value"
    },
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
      "default_value": "ORGNAME",
      "description": "Enter Default Organization Name",
      "required": true,
      "regexp": "",
      "name": "org_name",
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
