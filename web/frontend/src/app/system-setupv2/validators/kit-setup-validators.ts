import { IP_CONSTRAINT } from '../../constants/cvah.constants';
/**
 * How to use form validation:
 * The following is an object that has key value pair, where value is an array of validation objects and the key is the formcontrolName. The validation objects in the array are the following:
 *  {ops<any>: {}, error_message<string>: '', validatorFn<string>: ''}
 *
 * ops - ops refers to optional params. Here you can add anything you want that you might need.
 * error_message - the error message that will be displayed in the mat-error for that particular validation object.
 * However, some validation functions have multiple errors, so those will be returned accordingly (ex. validatorFn = ip&subnet )
 * validatorFn -  this is the validation function you want to call. Currently the string is used in a switch to determine which validation function can be used
 * the following are the avaliable options:
 * 1. pattern - {ops: {patter: /some_pattern/}, error_message: some_error_message, validatorFn: 'pattern'}
 * 2. unique - {error_message: some_error_message, validatorFn: 'unique'} ----- this requires an array to be added to ops in the formcontrol example:
 *              let nodes = this.kickStartFormGroup.get('nodes');
 *              formbuilder.group({
 *                  hostname: new FormControl('', Validators.compose([validateFromArray(kickstart_validators.hostname, { uniqueArray: nodes, formControlName: 'hostname' })]))
 *              });
 * 3. ip&subnet - { ops: { ip_range: [{ value: formControlName, label: 'Start Range' }] }, error_message: (value) => `${value} is not in the correct range.`, validatorFn: 'ip&subnet' }
 *                You can add more values to ip_range. the validator function will basically test against these. in the example above, value: formControlName,
 *                is the value/input field's formControlName you want to test your value against.
 *
 * 4. required - { error_message: some_error_message, validatorFn: 'required' }
 *
 * 5. minInArray - {ops: {minRequred: number, minRequiredValue: value, minRequiredArray: formArray, minRequiredControl: controlName }, error_message: some_error_message, validatorFn: 'minInArray'}
 *                 minRequired - the number of required values in the array, example: if you need for at least one to be true then this will be 1
 *                 minRequiredValue - the value that the min has to be, example: if you need for at least one to be true then this will be true
 *                 minRequiredArray: - the formarray that the validatorFunction will test against
 *                 minRequireControl: - the control inside the elements of the formarray, example if you need for at least one is_master_server to be true, then this will be is_master_server
 *          Notes: for minInArray, its a lot easier to add this validator to the formGroup directly contianing the formArray, the followwing is an example of how to do this along with multiple minInArray :
 *                     // in component.ts
 *                      kitFormGroup = this.formBuilder.group({
 *                          nodes: this.formBuilder.array([
 *                               this.formBuilder.group({
 *                                  node_type: new FormControl(''),
 *                                  is_master_server: new FormControl('')
 *                               })
 *                         ])
 *                      })
 *                     kitFormGroup.setValidators(Validators.compose([
 *                       validateFromArray(kit_validators.kit_form_one_master, { minRequired: 1, minRequiredValue: true, minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'is_master_server' }),
 *                       validateFromArray(kit_validators.kit_form_one_sensor, { minRequired: 1, minRequiredValue: 'Sensor', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
 *                       validateFromArray(kit_validators.kit_form_one_server, { minRequired: 1, minRequiredValue: 'Server', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
 *                     ]));
 *                   // in your enums.ts or form.ts
 *                      kit_validators = {
 *                       kit_form_one_server: [
 *                           { error_message: kit_validator_error_messages.at_least_one_server, validatorFn: 'minInArray' }
 *                       ],
 *                       kit_form_one_sensor: [
 *                           { error_message: kit_validator_error_messages.at_least_one_sensor, validatorFn: 'minInArray' }
 *                       ],
 *                       kit_form_one_master: [
 *                          { error_message: kit_validator_error_messages.at_least_one_master_server, validatorFn: 'minInArray' }
 *                       ]]
 *
 * the following is an example of a field that has unique, ip&subnet, required, and pattern
 *              // in the compoenent.ts
 *              let nodes = this.kickStartFormGroup.get('nodes');
 *              formbuilder.group({
 *                 ip_address: new FormControl('', Validators.compose([validateFromArray(kickstart_validators.ip_address, { uniqueArray: nodes, formControlName: 'ip_address', parentFormGroup: this.kickStartFormGroup })])),
 *              });
 *              // in your validator enums.ts
 *               ip_address: [
 *                   { error_message: (value) => `Duplicate IP Address found: ${value}. Node must have a unique IP Address.`, validatorFn: 'unique' },
 *                   { ops: { ip_range: [{ value: 'dhcp_start', label: 'DHCP Start Range' }, { value: 'dhcp_end', label: 'DHCP End Range' }] }, error_message: (value) => `${value} is not in the correct range.`, validatorFn: 'ip&subnet' },
 *                   { error_message: 'IP Address is required', validatorFn: 'required' },
 *                   { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
 *               ]
 */
export const vmwareSettingsValidators = {
  ip_address: [
    { error_message: 'IP Address is required.', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  username: [
    { error_message: 'Username is required.', validatorFn: 'required' },
  ],
  password: [
    { error_message: 'Password is a required.', validatorFn: 'required' },
  ],
  re_password: [
    { error_message: 'The passwords you entered do not match.  Please retype them carefully.', validatorFn: 'fieldMatch' }
  ]
};

export const kitSettingsValidators = {
  password: [
    { error_message: 'Password is a required.', validatorFn: 'required' },
    { error_message: 'Root password did not meet the password requirements.', validatorFn: 'password' }
  ],
  re_password: [
    { error_message: 'The passwords you entered do not match.  Please retype them carefully.', validatorFn: 'fieldMatch' }
  ],
  gateway: [
    { error_message: 'Gateway is required', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  netmask: [
    { ops: { pattern: /^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$/}, error_message: 'Must be a valid subnet mask such as 255.255.255.0', validatorFn: 'pattern' },
    { error_message: 'Netmask is required', validatorFn: 'required' }
  ],
  controller_interface: [{ error_message: 'Controller Interface is required', validatorFn: 'required' }],
  dhcp_range: [{ error_message: 'DHCP Range is required', validatorFn: 'required' }  ],
  upstream_dns: [{ ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }],
  upstream_ntp: [{ ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }],
  domain: [
    { ops: { pattern: /^[a-z]([a-z0-9-]){2,39}$/ }, error_message: 'Domain must be alphanumeric, less than 40 characters. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: 'Domain is required', validatorFn: 'required' }
  ],
  kubernetes_services_cidr: [
    { error_message: 'Kubernetetes Service IP is required', validatorFn: 'required' }
  ]
};

export const addNodeValidators = {
  hostname: [
    { error_message: (value) => `Duplicate hostnames found: ${value}. Node must have a unique hostnames.`, validatorFn: 'unique' },
    { ops: { pattern: /^[a-z]([a-z0-9-.]){4,39}$/ }, error_message: 'Hostname must be alphanumeric, less than 40 characters. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: 'Hostname is required', validatorFn: 'required' }
  ],
  ip_address: [
    { error_message: (value) => `Used IP Address found: ${value}. Node must have a unique IP Address.`, validatorFn: 'unique' },
    { error_message: 'IP Address is required.', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  mac_address: [
    { error_message: (value) => `Duplicate MAC Address found: ${value}. Node must have a unique MAC Address.`, validatorFn: 'unique' },
    { error_message: 'Mac Address is required', validatorFn: 'required' },
    { ops: { pattern: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/ }, error_message: 'You must enter a valid MAC Address.', validatorFn: 'pattern' }
  ],
  virtual_cpu: [
    { error_message: 'CPU is required', validatorFn: 'required' },
    { ops: { pattern: /([8-9])|([1-9][0-9]{1,})/ },
             error_message: 'You must enter a valid number for CPU. A minimum of 8 cores is required for each node.',
             validatorFn: 'pattern' }
  ],
  virtual_mem: [
    { error_message: 'Memory is required', validatorFn: 'required' },
    { ops: { pattern: /([8-9])|([1-9][0-9]{1,})/ },
             error_message: 'You must enter a valid number for memory. A minimum of 8 GB of RAM is required.',
             validatorFn: 'pattern' }
  ],
  os_drive: [
    { error_message: 'OS drive is required', validatorFn: 'required' },
    { ops: { pattern: /([5-9][0-9])|([1-9][0-9]{2,})/ },
             error_message: 'You must enter a valid number for disk. A minimum of 50GB is required.', validatorFn: 'pattern' }
  ],
  data_drive: [
    { error_message: 'Data drive is required', validatorFn: 'required' },
    { ops: { pattern: /([5-9][0-9])|([1-9][0-9]{2,})/ },
             error_message: 'You must enter a valid number for disk. A minimum of 50GB is required.', validatorFn: 'pattern' }
  ],
  boot_drives: [
    { error_message: 'Boot Drive is required', validatorFn: 'required' },
    { ops: { pattern: /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})*$/}, error_message: 'Boot Drive must be a single drive or a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  data_drives: [
    { error_message: 'Data Drive is required', validatorFn: 'required' },
    { ops: { pattern:  /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})*$/}, error_message: 'Data Drive must be a single drive or a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  pxe_type: [{ error_message: 'PXE Type start is required', validatorFn: 'required' }],
  raid_drives: [
    { error_message: 'Raid drives should be a comma separated list of drives for raid when software raid enabled for example sda,sdb', validatorFn: 'required' },
    { ops: { pattern: /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})+$/}, error_message: 'Raid Drives must be a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  os_raid_root_size: [{ error_message: 'Root Data parition size is required', validatorFn: 'required' }],
};

export const kickstart_validators = {
  hostname: [
    { ops: { pattern: /^[a-z]([a-z0-9-.]){4,39}$/ }, error_message: 'Hostname must be alphanumeric, less than 40 characters. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: (value) => `Duplicate hostnames found: ${value}. Node must have a unique hostnames.`, validatorFn: 'unique' },
    { error_message: 'Hostname is required', validatorFn: 'required' }
  ],

  mac_address: [
    { error_message: (value) => `Duplicate MAC Address found: ${value}. Node must have a unique MAC Address.`, validatorFn: 'unique' },
    { error_message: 'Mac Address is required', validatorFn: 'required' },
    { ops: { pattern: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/ }, error_message: 'You must enter a valid MAC Address.', validatorFn: 'pattern' }

  ],
  boot_drives: [
    { error_message: 'Boot Drive is required', validatorFn: 'required' },
    { ops: { pattern: /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})*$/}, error_message: 'Boot Drive must be a single drive or a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  data_drives: [
    { error_message: 'Data Drive is required', validatorFn: 'required' },
    { ops: { pattern:  /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})*$/}, error_message: 'Data Drive must be a single drive or a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  raid_drives: [
    { error_message: 'Raid drives should be a comma separated list of drives for raid when software raid enabled for example sda,sdb', validatorFn: 'required' },
    { ops: { pattern: /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})+$/}, error_message: 'Raid Drives must be a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],

  os_raid_root_size: [{ error_message: 'Root Data parition size is required', validatorFn: 'required' }],
  pxe_type: [{ error_message: 'PXE Type start is required', validatorFn: 'required' }],
  gateway: [
    { error_message: 'Gateway is required', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  netmask: [
    { ops: { pattern: /^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$/}, error_message: 'Must be a valid subnet mask such as 255.255.255.0', validatorFn: 'pattern' },
    { error_message: 'Netmask is required', validatorFn: 'required' }
  ],
  //general form validation
  controller_interface: [{ error_message: 'Controller Interface is required', validatorFn: 'required' }],
  domain: [
    { ops: { pattern: /^[a-z]([a-z0-9-]){2,39}$/ }, error_message: 'Domain must be alphanumeric, less than 40 characters. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: 'Domain is required', validatorFn: 'required' }
  ],

  dhcp_range: [
    { ops: { ip_range: [{ value: 'controller_interface', label: 'Controller Interface', testRange: true }, { value: 'netmask', label: 'Netmask', testRange: false }] }, error_message: 'Invalid selection', validatorFn: 'ip&subnet' },
    { error_message: 'DHCP Range is required', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' },
  ],
  dns: [
    { error_message: 'DNS Server is required', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' },
  ],
  luks_password: [
    { error_message: 'LUKS password did not meet the password requirements.', validatorFn: 'password' }
  ],
  confirm_luks_password: [
    { error_message: 'The LUKS passwords you entered do not match. Please retype them carefully.', validatorFn: 'fieldMatch' }
  ],
  timezone: [{ error_message: 'Timezone is required.', validatorFn: 'required' }],
  upstream_dns: [{ ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }],
  upstream_ntp: [{ ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }]
};

export const kickStartTooltips = {
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
  boot_drives: 'The boot drive is the disk name that will have the operating system installed during the kickstart process.  \
  If there are multiple drives (comma seperated), they will be combined into a RAID 0 pool',
  raid_drives: 'The raid drives is a comma separated list of drives that will be raid together in RAID 0.  \
  For example: sda,sdb',
  pxe_type: 'The PXE Type referes to the motherboards method of network booting.  \
  By default, the Supermicro uses BIOS and the HP DL160s use UEFI.\
  BIOS is sometimes called Legacy in the bios settings.',
  data_drives: 'The data drive is the disk name that will have the data partition configured during the kickstart process. \
  If there are multiple drives (comma seperated), they will be combined into a RAID 0 pool',
  dns: 'The DNS Server that MIPs use to resolve queries.',
  mip_pxe_type: 'The hard drive type determines the hard drive name used for booting. Match this with the MIP being Kickstarted.',
  luks_password: 'This is the password you will use to decrypt the disk.',
  confirm_luks_password: 'This is the password you will use to decrypt the disk.',
  timezone: 'The timezone set during Kickstart.',
  os_raid: 'This will Software combine all the drives into a single RAID 0 pool.  The OS and Data partitions will be created on this pool.',
  upstream_dns: 'The upstream DNS server is used to forward any non-local DNS request outside the kit.  \
  This is needed if the kit needs access to the internet or mission partner network.',
  upstream_ntp: 'The upstream NTP server is used to sync time with sources outside the kit.  \
  This is useful to keep the kit time settings in sync with internet or mission partner time sources.',
  os_raid_root_size: 'The size of the root partition when using OS raid.',
  kubernetes_services_cidr: `Range of addresses Kubernetes will use for external services.
    This includes Moloch viewer, Kibana, and Elasticq. This will use a /28 under the hood.
    This means it will take whatever IP address you enter and create a range addresses from that IP + 16.
    For example, 192.168.1.16 would become a range from 192.168.1.16-31`,
  duplicate_node: `Duplicate a node using incremented hostname and ip address fields.`,
};
