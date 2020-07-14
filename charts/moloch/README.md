{
    "id": "Moloch",
    "type": "chart",
    "node_affinity": "Sensor",
    "devDependent": "moloch-viewer",
    "formControls": [
        {
          "type": "checkbox",
          "default_value": "simple",
          "description": "Enable writing PCAPs (do not enable this and Suricata PCAP at the same time)",
          "trueValue": "simple",
          "falseValue": "disablepcap",
          "name": "pcapWriteMethod"
        },
        {
          "type": "textinput",
          "default_value": "",
          "description": "Enter BPF (packet filter applied to all traffic)",
          "required": false,
          "regexp": "",
          "name": "bpf"
        },
        {
          "type": "textinput",
          "default_value": "",
          "description": "Enter dontSaveBPFs (bpf filter to NOT save to disk)",
          "required": false,
          "regexp": "",
          "name": "dontSaveBPFs"
        },
        {
          "type": "textinput",
          "default_value": "25%",
          "description": "Enter freespaceG (can be number of Gigs to keep free, or a percentage of disk)",
          "required": false,
          "regexp": "^(\\d+|\\d{1,2}%)$",
          "name": "freespaceG",
          "error_message": "Enter a number or a percentage"
        },
        {
          "type": "textinput",
          "default_value": 25,
          "description": "Enter maxFileSizeG (max size per PCAP)",
          "required": false,
          "regexp": "^\\d+$",
          "name": "maxFileSizeG",
          "error_message": "Enter a number"
        },
        {
          "type": "textinput",
          "default_value": "basic",
          "description": "Enter magicMode",
          "required": false,
          "regexp": "^(libmagic|libmagicnotext|molochmagic|both|basic|none)$",
          "name": "magicMode",
          "error_message": "Enter a valid setting"
        },
        {
          "type": "textinput",
          "default_value": "20Gi",
          "description": "Enter Moloch memory limit",
          "required": false,
          "regexp": "^(\\d?[1-9]|[1-9]0)Gi$",
          "name": "mem_limit",
          "error_message": "Enter a valid setting"
        },
        {
          "type": "interface",
          "default_value": "",
          "description": "Select your network interfaces",
          "required": true,
          "name": "interfaces"
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
