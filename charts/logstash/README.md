{
    "id": "Logstash",
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
            "default_value": "2",
            "description": "Enter how many logstash replicas to run",
            "required": true,
            "regexp": "^\\d+$",
            "name": "replicas",
            "error_message": "Enter valid number"
        },
        
        {
            "type": "textinput",
            "default_value": "12",
            "description": "Enter how much memory to give each replica, in GB",
            "required": true,
            "regexp": "^\\d+$",
            "name": "heap_size",
            "error_message": "Enter valid number"
        },
        {
            "type": "textinput",
            "default_value": "",
            "description": "If you have a DIP setup with a PF Sense firewall, please enter the external IP Address of that here otherwise leave it blank.",
            "required": false,
            "regexp": "^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((25[0-4])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))$",
            "name": "external_ip",
            "error_message": "Enter valid IP"
        },
        {
            "type": "textinput",
            "default_value": "",
            "description": "If there is a DNS record in the partner network pointing to the PFsense/Logstash IP, please enter the external FQDN of that here otherwise leave it blank.",
            "required": false,
            "regexp": "^(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\\.)+[a-zA-Z]{2,63}$)$",
            "name": "external_fqdn",
            "error_message": "Enter valid FQDN"
        },
        {
            "type": "invisible",
            "name": "node_hostname"
        }
    ]
}
