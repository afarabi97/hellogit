---
id: zeek
type: chart
node_affinity: Sensor
formControls:
- type: textinputlist
  default_value: '["192.168.0.0/24"]'
  description: Enter your home/defended network in this format ["home network IP 1"," home network IP 2"] or ["any"]
  required: true
  regexp: ^\[\s*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))"\s*,\s*)*("(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))")\s*\]$
  name: home_net
  error_message: Enter a valid IP or 'any'
- type: interface
  default_value: ''
  description: Select the interfaces to listen on
  required: true
  regexp: ''
  name: interfaces
  error_message: Select one or more interfaces
- type: textinput
  default_value: '8'
  description: Enter the number of Zeek workers per interface (one thread per worker)
  required: true
  regexp: ^\d+$
  name: zeek_workers
  error_message: Enter a valid number
- type: invisible
  default_value: ''
  description: ''
  required: true
  regexp: ''
  name: affinity_hostname
- type: invisible
  default_value: ''
  description: ''
  required: true
  regexp: ''
  name: node_hostname
- type: zeek-list
  default_value:
  - capture_loss
  - connection
  - dce_rpc
  - dhcp
  - dnp3
  - dns
  - dpd
  - files
  - ftp
  - http
  - intel
  - irc
  - kerberos
  - modbus
  - mysql
  - notice
  - ntlm
  - ocsp
  - pe
  - radius
  - rdp
  - rfb
  - sip
  - smb_cmd
  - smb_files
  - smb_mapping
  - smtp
  - snmp
  - socks
  - ssh
  - ssl
  - stats
  - syslog
  - traceroute
  - tunnel
  - weird
  - x509
  - ntp
  - signature
  description: Uncheck the Zeek log types that are not needed
  required: true
  regexp: ''
  name: log_types
  error_message: Please ensure a log type is checked
