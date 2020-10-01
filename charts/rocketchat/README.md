{
    "id": "RocketChat",
    "type": "chart",
    "node_affinity": "Server - Any",
    "formControls": [
        {
          "type": "textinput",
          "default_value": "admin@dip.local",
          "description": "Enter RocketChat Admin email.",
          "required": true,
          "regexp": "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
          "name": "admin_email",
          "error_message": "Enter a value"
        },
        {
          "type": "textinput",
          "default_value": "password!",
          "description": "Enter RocketChat Admin password (min 8 characters)",
          "required": true,
          "regexp": "^.{8,}$",
          "name": "admin_pass",
          "error_message": "Enter a value"
        },
        {
          "type": "textinput",
          "default_value": "admin",
          "description": "Enter RocketChat Admin username",
          "required": true,
          "regexp": "",
          "name": "admin_user",
          "error_message": "Enter a value"
        },
        {
          "type": "invisible",
          "name": "node_hostname"
        }
    ]
}
