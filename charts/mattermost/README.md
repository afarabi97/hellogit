{
  "id": "mattermost",
  "type": "chart",
  "node_affinity": "Server - Any",
  "formControls": [
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
      "default_value": "1qaz@WSX1qaz@WSX",
      "description": "Enter Mattermost Admin password (min 10 characters, 1 upper, 1 number, 1 special character)",
      "required": true,
      "regexp": "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{10,}$",
      "name": "admin_pass",
      "error_message": "Enter a value"
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
