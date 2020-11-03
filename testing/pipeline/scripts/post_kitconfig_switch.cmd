configure terminal
interface ethernet 1/1/9
switchport access vlan kitnum36
copy running-configuration startup-configuration
write memory
