import {
    FormGroup, FormArray,
    AbstractControl,
    ValidationErrors
} from '@angular/forms';

import { HtmlInput, HtmlCheckBox, HtmlDropDown, HtmlCardSelector, HtmlHidden, HtmlDatePicker } from '../html-elements';
import { SensorResourcesForm } from '../total-sensor-resources-card/total-sensor-resources-form';
import { TotalServerResources } from '../total-server-resources-card/total-server-resources-form';
import {  PERCENT_PLACEHOLDER, PERCENT_MIN_MAX, PERCENT_INVALID_FEEDBACK,
    PERCENT_VALID_FEEDBACK, KUBE_CIDR_CONSTRAINT, IP_CONSTRAINT, HOST_CONSTRAINT,
    CONSTRAINT_MIN_ONE, MIN_ONE_INVALID_FEEDBACK,
    INVALID_FEEDBACK_INTERFACE, INVALID_FEEDBACK_IP,
    TIMEZONES
 } from '../frontend-constants';

import { BasicNodeResource, BasicNodeResourceInterface } from '../basic-node-resource-card/basic-node-resource-card.component';
import { TotalSystemResources } from '../total-system-resource-card/total-system-resource-form';
import { ValidateKitInventory } from './kit-form-validation';


export interface DeviceFactsContainerInterface{
    deviceFacts: Object;
}

/**
 * Sets the drive selections based on the passed in deviceFacts.
 *
 * @param deviceFacts
 * @returns - [{value: "sdb", label: "sdb - 50 GB"}]
 */
function SetDriveSelections(deviceFacts: Object) : Array<{value: string, label: string}> {
    let driveSelections = new Array();

    if (deviceFacts == null){
        return driveSelections;
    }

    for (let item of deviceFacts["disks"]){
        if (item["hasRoot"]){
            continue;
        }
        driveSelections.push({value: item["name"], label: item["name"] + " - " + item["size_gb"].toFixed(2) + " GB"})
     }
    return driveSelections;
}

export class SensorFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public interfaceSelections: Array<{value: string, label: string}>;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string, sensor_type: string) {
        super({});
        this.hidden = hidden;
        this.host_sensor.setDefaultValue(managementIP);
        super.addControl('host_sensor', this.host_sensor);
        super.addControl('monitor_interface', this.monitor_interface);
        super.addControl('ceph_drives', this.ceph_drives);
        super.addControl('pcap_drives', this.pcap_drives);
        super.addControl('hostname', this.hostname);
        super.addControl('bro_cpu_percentage', this.bro_cpu_percentage);
        super.addControl('suricata_cpu_percentage', this.suricata_cpu_percentage);
        super.addControl('moloch_cpu_percentage', this.moloch_cpu_percentage);        

        //this.sensor_type.
        this.sensor_type.setValue(sensor_type);
        super.addControl('sensor_type', this.sensor_type);
        this.basicNodeResource = new BasicNodeResource();
        this.deviceFacts = null;
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();
    }

    clearSelectors(){
        while (this.pcap_drives.length !== 0) {
            this.pcap_drives.removeAt(0);
        }

        while (this.ceph_drives.length !== 0) {
            this.ceph_drives.removeAt(0);
        }

        while (this.monitor_interface.length !== 0) {
            this.monitor_interface.removeAt(0);
        }
    }

    getRawValue(): any {
        let rawValue = super.getRawValue();
        rawValue['deviceFacts'] = this.deviceFacts;
        return rawValue;
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.monitor_interface.disable();
        this.ceph_drives.disable();
        this.pcap_drives.disable();
        this.bro_cpu_percentage.disable();
        this.suricata_cpu_percentage.disable();
        this.moloch_cpu_percentage.disable();        
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }): void{
        super.enable(opts);
        this.host_sensor.disable();
        this.sensor_type.disable();
    }

    /**
     * When calling this make sure you call set_drive_selections
     * after you have set deviceFacts.
     *
     * @param mObj
     */
    public from_object(mObj: Object){
        this.deviceFacts = mObj['deviceFacts'];
        this.host_sensor.setValue(mObj['host_sensor']);
        this.hostname.setValue(mObj['hostname']);
        this.sensor_type.setValue(mObj['sensor_type']);
        this.bro_cpu_percentage.setValue(mObj['bro_cpu_percentage']);
        this.suricata_cpu_percentage.setValue(mObj['suricata_cpu_percentage']);
        this.moloch_cpu_percentage.setValue(mObj['moloch_cpu_percentage']);
        this.monitor_interface.default_selections = mObj['monitor_interface'];
        this.pcap_drives.default_selections = mObj['pcap_drives'];
    }

    hostname = new HtmlHidden('hostname', true);

    /**
     * Sets option selections for both interfaces and CEPH drives.
     */
    public setSensorOptionsSelections(managementIp: string){
        if (this.deviceFacts == null){
            return;
        }

        //Reset selections if user clicks on Gather facts twice.
        this.interfaceSelections = new Array();
        this.driveSelections = new Array();
        this.driveSelections = SetDriveSelections(this.deviceFacts);

        for (let item of this.deviceFacts["interfaces"]){
            if (item["name"] == 'lo'){
                continue;
            }

            if (item["ip_address"] == managementIp){
                continue;
            }

            this.interfaceSelections.push({value: item["name"], label: item["name"]})
        }
    }

    host_sensor = new HtmlInput (
        'host_sensor',
        'Management IP Address',
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        undefined,
        '',
        undefined,
        true
    )

    monitor_interface = new HtmlCardSelector(
        'monitor_interface',
        'Select Monitor Interface',
        "The interfaces on the sensor you would like to use for monitoring.\
        These will be the interfaces that Moloch, Bro, and Suricata use.\
        Note: The management interface will not appear in this list. You \
        cannot use an interface for both management and monitoring.",
        "Select which interfaces you would like to use as monitor interfaces.",
        "Note: The management interface will not be listed below. It is not eligble for use as a monitor interface.",
        INVALID_FEEDBACK_INTERFACE,
        true,
    )

    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )

    pcap_drives = new HtmlCardSelector (
        'pcap_drives',
        "PCAP Drives",
        "TODO Add a PCAP description here.",
        "Select which drive you would like to use for PCAP storage.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        false
    )

    sensor_type = new HtmlInput(
        'sensor_storage_type',
        'Sensor Type',
        '',
        'text',
        null,
        '',
        true,
        'test',
        "Indicates if the sensor in question is a local or a remote sensor.",
        undefined,
        true        
    )    

    moloch_cpu_percentage = new HtmlInput (
        'moloch_cpu_percentage',
        'Moloch CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '19',
        "This is the percentage of millicpus that will be allocated to the Moloch pod running on this sensor. \
        On sensors 1200m CPUs (1.2 CPU cores) is reserved for OS and kube services. The rest of the nodes resources \
        is used for pods.  Of those resources, 5 5% is reserved for system pods.",
        PERCENT_VALID_FEEDBACK
    )

    suricata_cpu_percentage = new HtmlInput (
        'suricata_cpu_percentage',
        'Suricata CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '6',
        "This is the percentage of millicpus that will be allocated to the Suricata pod running on this sensor. \
        On sensors 1200m CPUs (1.2 CPU cores) is reserved for OS and kube services. The rest of the nodes resources \
        is used for pods.  Of those resources, 5 5% is reserved for system pods.",
        PERCENT_VALID_FEEDBACK
    )

    bro_cpu_percentage = new HtmlInput (
        'bro_cpu_percentage',
        'Bro CPU %',
        PERCENT_PLACEHOLDER,
        'number',
        PERCENT_MIN_MAX,
        PERCENT_INVALID_FEEDBACK,
        true,
        '58',
        "This is the percentage of millicpus that will be allocated to the Bro pod running on this sensor. \
        On sensors 1200m CPUs (1.2 CPU cores) is reserved for OS and kube services. The rest of the nodes resources \
        is used for pods.  Of those resources, 5 5% is reserved for system pods.",
        PERCENT_VALID_FEEDBACK
    )
}

export class ServerFormGroup extends FormGroup implements BasicNodeResourceInterface, DeviceFactsContainerInterface {
    public hidden: boolean;
    public basicNodeResource: BasicNodeResource;
    public deviceFacts: Object;
    public driveSelections: Array<{value: string, label: string}>;

    constructor(hidden: boolean, managementIP: string, disableIsKubernetesMasterCheckbox: boolean=false) {
        super({});
        this.hidden = hidden;
        this.host_server.setDefaultValue(managementIP);
        super.addControl('host_server', this.host_server);
        super.addControl('is_master_server', this.is_master_server);
        super.addControl('ceph_drives', this.ceph_drives)
        super.addControl('hostname', this.hostname);
        if (disableIsKubernetesMasterCheckbox){
            this.is_master_server.disable();
        }
        this.basicNodeResource = new BasicNodeResource();
        this.driveSelections = new Array();
        this.deviceFacts = null;
    }

    clearSelectors(){
        while (this.ceph_drives.length !== 0) {
            this.ceph_drives.removeAt(0);
        }
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.is_master_server.disable();
        this.ceph_drives.disable();
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
      }): void{
        super.enable(opts);
        this.host_server.disable();
    }

    getRawValue(): any {
        let rawValue = super.getRawValue();
        rawValue['deviceFacts'] = this.deviceFacts;
        return rawValue;
    }

    /**
     * After you call this make sure you set drive selections
     * after you have set deviceFacts.
     *
     * @param mObj
     */
    public from_object(mObj: Object){
        this.deviceFacts = mObj['deviceFacts'];
        this.host_server.setValue(mObj['host_server']);
        this.hostname.setValue(mObj['hostname']);
        this.is_master_server.checked = mObj['is_master_server'];
        this.is_master_server.setValue(mObj['is_master_server']);
        this.ceph_drives.default_selections = mObj['ceph_drives'];
    }

    public setOptionSelections(){
        this.driveSelections = SetDriveSelections(this.deviceFacts);
    }

    hostname = new HtmlHidden('hostname', true);

    host_server = new HtmlInput (
        'host_server',
        'Management IP Address',
        "Server's management IP address",
        'text',
        IP_CONSTRAINT,
        'You must input the server management IP address.',
        true,
        undefined,
        '',
        undefined,
        true        
    )

    is_master_server = new HtmlCheckBox(
        "is_master_server",
        "Is Kubernetes master server?",
        "This is not the ESXi/VM server. This is for the Kubernetes master server only.\
        There can only be one master server. It is a bit like the Highlander that way.\
        The master server is special in that it runs the Kubernetes master and is     \
        responsible for deploying services out to all the other hosts in the cluster. \
        This server should be fairly beefy. By default, this server will also provide \
        DNS to the rest of the kit for internal services. WARNING: If this server     \
        fails, the entire kit goes down with it!!!"
    )

    //TODO make this spot dry
    ceph_drives = new HtmlCardSelector (
        'ceph_drives',
        "Ceph Drives",
        "Use this field to mark the disks you will use for Ceph. You can choose to select \
        none. In this case, Ceph will still be installed and active on the machine so that \
        Kubernetes works properly however, none of its disks will be in the Ceph cluster. \
        This is common on the sensors. You may choose to use direct attached storage for \
        your PCAP on one drive and then use the other for your OS. In which case, Moloch \
        can still write over the network to a clustered drive on another machine for its \
        metadata which is light weight especially compared to PCAP. You can select multiple \
        drives if you would like. Make sure you don't select the OS' drive as Ceph will \
        format and overwrite any drives you select.",
        "Select which drives on the host, if any, that you would like to add to the Ceph cluster.",
        "Note: The operating system's drive will not appear here. If a drive has the root file system mounted to it, it is excluded. This means you may only have one drive listed.",
        "No drives found.",
        true
    )
}

export class SensorsFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }
}

export class ServersFormArray extends FormArray {
    constructor(controls: AbstractControl[],
                public hidden: boolean) {
        super(controls);
    }
}

function validateIPOrHost(control: AbstractControl): ValidationErrors | null {
    let ctrl = control as HtmlInput;    
    let patterns: Array<string> = [IP_CONSTRAINT, HOST_CONSTRAINT];
    let isValid = false;

    if (!ctrl.required && control.value === ""){
        return null;
    }

    for (let pattern of patterns){
        let pat = new RegExp(pattern);
        let result = pat.test(control.value);

        if (!isValid){
            isValid = result;
        }
    }

    if (!isValid){
        
        return {"custom_error": ctrl.invalid_feedback};
    } 

    return null;
  }

export class KitInventoryForm extends FormGroup {
    servers: ServersFormArray;
    sensors: ServersFormArray;
    endgame_warning: string;
    kubernetesCidrInfoText;

    constructor() {
        super({}, ValidateKitInventory);
        super.addControl('kubernetes_services_cidr', this.kubernetes_services_cidr);

        this.servers = new ServersFormArray([], true);
        this.sensors = new SensorsFormArray([], true);
        this.endgame_warning = '';
        super.addControl('servers', this.servers);
        super.addControl('sensors', this.sensors);
        super.addControl('sensor_resources', this.sensor_resources);
        super.addControl('server_resources', this.server_resources);
        super.addControl('dns_ip', this.dns_ip);
        super.addControl('ceph_redundancy', this.ceph_redundancy);
        super.addControl('endgame_iporhost', this.endgame_iporhost);
        super.addControl('endgame_username', this.endgame_username);
        super.addControl('endgame_password', this.endgame_password);
        super.addControl('install_grr', this.install_grr);
        super.addControl('enable_percentages', this.enable_percentages);
        this.kubernetesCidrInfoText = "";
    }

   /**
    * Overridden method
    */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.addSensorFormGroup(null, null);
        this.addServerFormGroup(null);
        super.reset({});
        this.clearNodes();
        this.system_resources.reinitalize();
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.enable(opts);        
    }

    /**
     * Overridden method
     *
     * @param opts
     */
    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {        
        this.kubernetes_services_cidr.disable();

        this.servers.disable();
        this.sensors.disable();
        this.sensor_resources.disable();
        this.server_resources.disable();
            
        this.dns_ip.disable();
        this.ceph_redundancy.disable();
        this.endgame_iporhost.disable();
        this.endgame_username.disable();
        this.endgame_password.disable();
        this.install_grr.disable();
        this.enable_percentages.disable();
    }

    public clearNodes() {
        while (this.servers.length !== 0) {
            this.servers.removeAt(0);
        }
        while (this.sensors.length !== 0) {
            this.sensors.removeAt(0);
        }
    }

    public addServerFormGroup(managementIP: string, disableIsKubernetesMasterCheckbox: boolean=false){
        this.servers.hidden = false;
        this.servers.push(new ServerFormGroup(false, managementIP, disableIsKubernetesMasterCheckbox));
    }

    public addSensorFormGroup(managementIP: string, sensorType: string) {
        this.sensors.hidden = false;
        this.sensors.push(new SensorFormGroup(false, managementIP, sensorType));
    }

    system_resources = new TotalSystemResources();
    server_resources = new TotalServerResources();
    sensor_resources = new SensorResourcesForm();

    endgame_iporhost = new HtmlInput(
        'endgame_iporhost',
        'Endgame IP or Hostname',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        validateIPOrHost,
        'You must enter a valid hostname or IP address for the Endgame server.',
        false,
        '',
        "Setting this enables a script which will pull Endgame data into Elasticsearch for easier pivoting/maneuver on Endgame data."
    )

    endgame_username = new HtmlInput(
        'endgame_username',
        'Endgame Username',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        null,
        '',
        false,
        '',
        "The username needed for Endgame integration."
    )

    endgame_password = new HtmlInput(
        'endgame_password',
        'Endgame Password',
        'Optional field.  This is only required if you want to setup Endgame integration with your Kit configuration.',
        'text',
        null,
        '',
        false,
        '',
        "The password needed for Endgame integration."
    )

    kubernetes_services_cidr = new HtmlDropDown(
        'kubernetes_services_cidr',
        'Kubernetes Service IP Range Start',
        [],
        "Services_cidr is the range of addresses kubernetes will use for external services \
        This includes cockpit (a front end for Kubernetes), Moloch viewer, Kibana, elastichq, kafka-manager, and the \
        kubernetes dashboard. This will use a /28 under the hood. This means it will take \
        whatever IP address you enter and create a range addresses from that IP +16. For example, \
        192.168.1.16 would become a range from 192.168.1.16-31."        
    )

    dns_ip = new HtmlInput(
        'dns_ip',
        'DNS IP Address',
        "Same as Master Server management IP",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        false,
        undefined,
        "The IP address of the system DNS server. You may define this or it will   \
        default  to using the master server's management IP. We suggest you leave \
        it to default  unless you have a specific reason to use a different DNS   \
        server. Keep in mind  you will need to manually provide all required DNS  \
        entries on your separate  DNS Server or the kit will break."
    )    

    ceph_redundancy = new HtmlCheckBox(
        "ceph_redundancy",
        "Ceph Redundancy",
        "You can set how many OSD are allowed to fail without losing data. For replicated pools, it is the \
        desired number of copies/replicas of an object. Our configuration stores an object and one \
        additional copy, The check box will enable this."
    )

    install_grr = new HtmlCheckBox(
        "install_grr",
        "Install Google Rapid Response",
        "WARNING: Installing Google Rapid Response is an alpha feature.  \
        Google Rapid Response is an open sourced, agent based, endpoint protection platform.  \
        You can use to to hunt for threats on host systems."
    )

    enable_percentages = new HtmlCheckBox(
        "enable_percentages",
        "Enable percentages",
        "Overrides the server calculations to include to user specified percentages for servers and sensors.."
    )
}


export class ExecuteKitForm extends FormGroup {    

    constructor() {
        super({});
        super.addControl('date', this.date);
        super.addControl('time', this.time);
        super.addControl('timezone', this.timezone);
    }
  
    date = new HtmlDatePicker(
        'date',
        'Current Date',
        true,
        'This is the date used for your cluster.  Make sure it is correct before executing your kit configuration.',
    )

    time = new HtmlInput(
        'time',
        'Current Time',
        'HH:MM in military time',
        'text',
        '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$',
        'Invalid. The proper format should be HH:MM in military time.',
        true,
        '',
        'This is the time used for your cluster.  Make sure it is correct before executing your kit configuration.'
    )

    timezone = new HtmlDropDown(
        'timezone',
        'Timezone',
        TIMEZONES,
        "This option is sets each node's timezone during the kickstart provisioning process (Automated Operating System installation).",
        'UTC'
    )
}
