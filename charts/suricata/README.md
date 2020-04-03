{
  "id": "suricata",
  "type": "chart",
  "node_affinity": "Sensor",
  "formControls": [
    {
      "type": "checkbox",
      "default_value": false,
      "description": "Enable writing PCAPs (do not enable this and Moloch PCAP at the same time)",
      "trueValue": true,
      "falseValue": false,
      "name": "pcapEnabled"
    },
    {
      "type": "textinputlist",
      "default_value": "[\"192.168.0.0/24\"]",
      "description": "Enter your home/defended network in this format [\"home network IP 1\", \" home network IP 2\"] or [\"any\"]",
      "required": true,
      "regexp": "^\\[\\s*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\"\\s*,\\s*)*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\")\\s*\\]$",
      "name": "home_net",
      "error_message": "Enter a valid IP or 'any'"
    },
    {
      "type": "textinputlist",
      "default_value": "",
      "description": "Enter your external/untrusted network (defaults to !home_net) [\"external network IP 1\", \" external network IP 2\"] or [\"any\"]",
      "required": false,
      "regexp": "^(\\s*|\\[\\s*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\"\\s*,\\s*)*(\"(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\")\\s*\\])$",
      "name": "external_net",
      "error_message": "Enter a valid IP or 'any'"
    },
    {
      "type": "interface",
      "default_value": "",
      "description": "Select the interfaces to listen on",
      "required": true,
      "regexp": "",
      "name": "interfaces",
      "error_message": "Select one or more interfaces"
    },
    {
      "type": "textinput",
      "default_value": "8",
      "description": "Enter the number of Suricata threads per interface",
      "required": true,
      "regexp": "^\\d+$",
      "name": "suricata_threads",
      "error_message": "Enter a valid number"
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