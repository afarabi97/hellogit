configure terminal
interface range ethernet 1/1/9-1/1/10
switchport access vlan kitnum35
copy running-configuration startup-configuration
write memory
