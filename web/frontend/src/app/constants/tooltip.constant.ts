export const COMMON_TOOLTIPS = {
  gateway: 'The gateway address or default gateway is usually a routable address to the local network.  \
  This field is specifically used as a part of the static interface assignment during the operating system installation.',
  netmask: 'The netmask is the network address used for subnetting.  \
  This field is specifically used as a part of the static interface assignment during the operating system installation.',
  hostname: 'The hostname is the nodes name that will be assigned during the installation of the operating system.  \
  This should match the hostname used by the DNS server.',
  ip_address: `The node's ip address is used during the kickstart process to statically assign its network interface.`,
  mac_address: `The mac address is the network interface's physical  address.  \
  This address is used by the dhcp server to provide the node a specific pxe file used for network booting.\
  If the mac address is incorrect the node will not be able to network boot.`,
  dhcp_range: 'DHCP range is the range of addresses the DHCP server will use for kickstarting \
  machines on the network. This means it will take whatever IP address you select \
  and create range addresses from that IP +16. For example, \
  192.168.1.16 would become a range from 192.168.1.16-31.',
  domain: 'The Domain Name used for the kit this should be unique domain for each kit',
  password: `The root password will be how to log into each server and sensor after the kickstart process completes.  \
  Do not forget this password or you will not be able to complete the system installation.`,
  re_password: `The root password will be how to log into each server and sensor after the kickstart process completes.  \
  Do not forget this password or you will not be able to complete the system installation.`,
  dns: 'The DNS Server that MIPs use to resolve queries.',
  luks_password: 'This is the password you will use to decrypt the disk.',
  confirm_luks_password: 'This is the password you will use to decrypt the disk.',
  timezone: 'The timezone set during Kickstart.',
  raid0_override: 'WARNING! Selecting this will force the Data parition to be RAID 0. While this is the most performat option, one drive failure will result in mission data loss!',
  upstream_dns: 'The upstream DNS server is used to forward any non-local DNS request outside the kit.  \
  This is needed if the kit needs access to the internet or mission partner network.',
  upstream_ntp: 'The upstream NTP server is used to sync time with sources outside the kit.  \
  This is useful to keep the kit time settings in sync with internet or mission partner time sources.',
  kubernetes_services_cidr: `Range of addresses Kubernetes will use for external services.
    This includes Moloch viewer, Kibana, and Elasticq. This will use a /28 under the hood.
    This means it will take whatever IP address you enter and create a range addresses from that IP + 16.
    For example, 192.168.1.16 would become a range from 192.168.1.16-31`,
  duplicate_node: `Duplicate a node using incremented hostname and ip address fields.`,
  virtual_cpu: 'Amount of CPU cores used during virtual machine configuraion.',
  virtual_mem: 'Amount of RAM memory used during virtual machine configuraion.',
  virtual_os: 'Amount of OS drive space used during virtual machine configuraion.',
  virtual_data: 'Amount of Data drive space used during virtual machine configuraion.'
};
