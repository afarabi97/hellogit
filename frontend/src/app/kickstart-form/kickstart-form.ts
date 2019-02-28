import { FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ValidateKickStartInventoryForm } from './kickstart-form-validation';
import { IP_CONSTRAINT, IP_CONSTRAINT_WITH_SUBNET, DESC_ROOT_PASSWORD, INVALID_FEEDBACK_IP } from '../frontend-constants';
import { HtmlInput, HtmlDropDown, HtmlCardSelector, HtmlTextArea, HtmlCheckBox } from '../html-elements';

export class NodeFormGroup extends FormGroup {
  public hidden: boolean;
  public isDisabled: boolean;

  constructor(hidden: boolean, isDisabled: boolean = false) {
    super({});
    super.addControl('hostname', this.hostname);
    super.addControl('ip_address', this.ip_address);
    super.addControl('mac_address', this.mac_address);
    super.addControl('boot_drive', this.boot_drive);
    super.addControl('pxe_type', this.pxe_type);
    super.addControl('node_type', this.node_type);
    this.hidden = hidden;
    this.isDisabled = isDisabled;
  }

  /**
   * Overridden method so that this FromGroup is properly disabled.
   * 
   * @param opts 
   */
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.hostname.disable();
    this.ip_address.disable();
    this.mac_address.disable();
    this.boot_drive.disable();
    this.pxe_type.disable();
    this.node_type.disable();
    this.isDisabled = true;
  }

  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.hostname.enable();
    this.ip_address.enable();
    this.mac_address.enable();
    this.boot_drive.enable();
    this.pxe_type.enable();
    this.node_type.enable();
    this.isDisabled = false;
  }

  /**
   * Overridden method
   */
  reset(value?: any, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    super.reset({'pxe_type': this.pxe_type.default_value,
                 'node_type': this.node_type.default_value
    });
  }

  hostname = new HtmlInput(
    'hostname',
    'Hostname',
    "Enter a node hostname ending with .lan",
    'text',
    "^[a-zA-Z]([a-zA-Z]|[0-9]|[-])*[.]lan$",
    'Hostnames must be alphanumeric and end with .lan. Special characters are not allowed with the exception of dashes (IE -).',
    true,
    '',
    "The hostname is the nodes name that will be assigned during the installation of the operating system.  \
      This should match the hostname used by the DNS server.",
  )

  ip_address = new HtmlInput(
    'ip_address',
    'IP Address',
    "Enter your node IP address here",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    true,
    '',
    "The node ip address is used during the kickstart process to statically assign the node's interface.",
    undefined,
    false,
    true,
    'Select unused IP'
  )

  mac_address = new HtmlInput(
    'mac_address',
    'MAC Address',
    "Enter a mac address",
    'text',
    '^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$',
    'You must enter a valid mac address',
    true,
    '',
    "The mac address is the network interface's physical  address.  \
       This address is used by the dhcp server to provide the node a specific pxe file used for network booting.\
       If the mac address is incorrect the node will be able to network boot."
  )

  boot_drive = new HtmlInput(
    'boot_drive',
    'Boot Drive',
    "Enter a boot drive for example: sda",
    'text',
    "",
    '',
    true,
    'sda',
    "The boot drive is the disk name that will have the operating system installed during the kickstart process.  \
       By default, the Supermicro will use sda and the HP DL160 will use sdb."
  )

  pxe_type = new HtmlDropDown(
    'pxe_type',
    'PXE Type',
    ['BIOS', 'UEFI', 'DL160', 'SuperMicro'],
    "The PXE Type referes to the motherboards method of network booting.  \
       By default, the Supermicro uses BIOS and the HP DL160s use UEFI.\
       BIOS is sometimes called Legacy in the bios settings.",
    'BIOS'
  )

  node_type = new HtmlDropDown(
    'node_type',
    'Node Type',
    ['Server', 'Sensor', 'Remote Sensor'],
    "The Node Type referes to whether or not the node is a server, sensor or remote sensor.",
    'Server'
  )
}

export class NodesFormArray extends FormArray {
  constructor(controls: AbstractControl[],
    public hidden: boolean) {
    super(controls);
  }
}

export class KickstartInventoryForm extends FormGroup {
  nodes: NodesFormArray;
  interfaceSelections: Array<{value: string, label: string}>;

  constructor() {
    super({}, ValidateKickStartInventoryForm);
    super.addControl('dhcp_start', this.dhcp_start);
    super.addControl('dhcp_end', this.dhcp_end);
    super.addControl('gateway', this.gateway);
    super.addControl('netmask', this.netmask);
    super.addControl('root_password', this.root_password);
    super.addControl('re_password', this.re_password);
    
    super.addControl('controller_interface', this.controller_interface);    
    this.nodes = new NodesFormArray([], true);
    super.addControl('nodes', this.nodes);
    this.interfaceSelections = new Array();
  }

  public setInterfaceSelections(deviceFacts: Object){
    for (let item of deviceFacts["interfaces"]){
      this.interfaceSelections.push({value: item["ip_address"], label: item["name"] + ' - ' + item["ip_address"] });
    }
  }

  public clearNodes() {
    while (this.nodes.length !== 0) {
      this.nodes.removeAt(0);
    }
  }

  public addNodeGroup(hidden: boolean = false, arrayFormHidden: boolean = false) {
    this.nodes.hidden = arrayFormHidden;
    this.nodes.push(new NodeFormGroup(hidden));
  }

  /**
   * Overridden method
   */
  reset(value?: any, options?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {    
    super.reset({'netmask': this.netmask.default_value });
    this.clearNodes();
  }

  /**
   * Overridden method
   * @param opts 
   */
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{
    this.dhcp_start.disable();
    this.dhcp_end.disable();
    this.gateway.disable();
    this.netmask.disable();
    this.root_password.disable();
    this.re_password.disable();
    this.controller_interface.disable();
    this.nodes.disable();    
  }
  
  dhcp_start = new HtmlInput(
    'dhcp_start',
    'DHCP Starting Ip Address',
    'The beginning of your DHCP start range',
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    false,
    "",
    "This field is used to identify the starting ip address of the dhcp range.  The dhcp range is only used during the network boot process.\
    The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time. \
    Be sure not to use a range will be cause conflicts with existing network devices.")

  dhcp_end = new HtmlInput(
    'dhcp_end',
    'DHCP Ending Ip Address',
    "The end of your DHCP range",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    false,
    "",
    "This field is used to identify the ending ip address of the dhcp range.  \
      The dhcp range should be enough addresses to temporary support all nodes to be network booted at the same time.")

  gateway = new HtmlInput(
    'gateway',
    'Gateway',
      "Enter your kit's gateway here",
    'text',
    IP_CONSTRAINT,
    INVALID_FEEDBACK_IP,
    true,
    "",
    "The gateway address or default gateway is usually a routable address to the local network.  \
      This field is specifically used as a part of the static interface assignment during the operating system installation.")

  netmask = new HtmlInput(
    'netmask',
    'Netmask',
    "255.255.255.0",
    'text',
    IP_CONSTRAINT_WITH_SUBNET,
    'Please enter a valid Netmask.',
    true,
    "255.255.255.0",
    "The netmask is the network address used for subnetting.  \
      This field is specifically used as a part of the static interface assignment during the operating system installation.")

  root_password = new HtmlInput(
    'root_password',
    'Root Password',
    '',
    'password',
    '^.{6,}$',
    'You must enter a root password with a minimum length of 6 characters.',
    true,
    '',
    DESC_ROOT_PASSWORD)

  re_password = new HtmlInput(
    're_password',
    'Retype Password',
    '',
    'password',
    '^.{6,}$',
    'You must re-enter the root password.',
    true,
    '',
    DESC_ROOT_PASSWORD
  )

  controller_interface = new HtmlCardSelector (
    'controller_interface',
    "Controller Interface",      
    "The interfaces on the controller you would like to use.",
    "Select which interface you would like to use as the controller interface. This will be the interface used for services provided to the kit.",
    "Warning: Interfaces without IP addresses will not be listed!",
    "No interfaces found! Are you sure you have a second eligible interface that is not the management interface?",
    false
  )

}

export class CommentForm extends FormGroup {

  constructor(){
    super({});
    super.addControl('comment', this.comment);
  }

  comment = new HtmlTextArea(
    'comment',
    'Comment',
    'Enter a reminder as to what this configuration is for.',
    '',
    'A useful comment for remembering what this form is for.',
    true
  )
}