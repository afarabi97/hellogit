import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlDropDown } from '../html-elements';
import { ServerFormGroup, SensorFormGroup, SensorsFormArray, ServersFormArray, KitInventoryForm } from './kit-form';
import { CEPH_DRIVE_MIN_COUNT, IP_CONSTRAINT } from '../frontend-constants';
import { CheckForInvalidControls } from '../globals';

/**
 * Ensures that the user has selected at least one server as a master.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateMasterServer(control: AbstractControl, errors: Array<string>): void {
    let servers = control.get('servers') as ServersFormArray;
    if (servers != null){
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            if  (server.is_master_server.value){
                return;
            }
        }
    }
    errors.push("- Master server failed to validate. Did you remember to select a master server? (It's the checkbox that says 'Is Kubernetes master server?')");
}

/**
 * Ensures that there are enough drives selected for the CEPH cluster configuration.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateCephDriveCount(control: AbstractControl, errors: Array<string>): void {
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    let ceph_drive_count = 0;

    if (servers != null) {
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;            
            ceph_drive_count += server.ceph_drives.length;
        }
    }

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            ceph_drive_count += sensor.ceph_drives.length;
        }
    }

    if (ceph_drive_count < CEPH_DRIVE_MIN_COUNT){
        errors.push("- Ceph drives failed to validate. You have to have at least two drives in your Ceph cluster.");
    }
}

function _validate_pcap_drives(control: AbstractControl, errors: Array<string>): void {
    let kitForm = control as KitInventoryForm;
    let sensors = control.get('sensors') as SensorsFormArray;
    let pcap_drive_count = 0;
    
    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if(sensor.pcap_drives.length !== 1){
                errors.push("- PCAP drives failed to validate. You need to select at one PCAP drive on each sensor.")
            }
        }
    }
    
}

/**
 * Ensures that at least one interface is selected for each sensor
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateMonitorInterfaces(control: AbstractControl, errors: Array<string>): void {
    let sensors = control.get('sensors') as SensorsFormArray;
    let error_message = "- Monitor interfaces failed to validate. You need to select at least one monitor interface on each sensor.";

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (sensor.monitor_interface.length == 0) {
                errors.push(error_message);
                break;
            }
        }
    } else {
        errors.push(error_message);
    }
}


/**
 * Ensures the user entered the Kubernetes CIDR value.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateKubernetesCIDR(control: AbstractControl, errors: Array<string>): void {
    let kubernetes = control.get('kubernetes_services_cidr') as HtmlDropDown;
    if (kubernetes != null){
        let pat = new RegExp(IP_CONSTRAINT);
        if (!pat.test(kubernetes.value)){
            errors.push("- Kubernetes services CIDR failed to validate. Make sure you type in a valid Kubernetes services CIDR under Global Settings.");
        }        
    }
}

/**
 * Ensures at least home net is filled out.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateHomeNet(control: AbstractControl, errors: Array<string>): void {
    let sensor_resources = control.get('sensor_resources');    

    if (sensor_resources != null){
        let home_nets = sensor_resources.get('home_nets') as FormArray;
        const message: string = "- Your home nets are not valid. You need at least one home net.";

        if (home_nets.length === 0){
            errors.push(message);
            return;
        }

        for (let i = 0; i < home_nets.length; i++){
            if (!home_nets.at(i).valid){
                errors.push(message);
                return;
            }
        }
    }
}

/**
 * Ensures at least one external net is filled out.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateExternalNet(control: AbstractControl, errors: Array<string>): void {
    let sensor_resources = control.get('sensor_resources');

    if (sensor_resources != null){
        let external_nets = sensor_resources.get('external_nets') as FormArray;

        for (let i = 0; i < external_nets.length; i++){
            if (!external_nets.at(i).valid){
                errors.push("- Your external nets are not valid. Remove it or enter a valid value.");
                return;
            }
        }
    }
}

/**
 * Validates that the user hit the "Gather Facts" button for each sensor and server.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateHosts(control: AbstractControl, errors: Array<string>): void {
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    let invalid_host:string = '- Invalid hostname. Did you forget to click "Gather Facts" on one of your sensors or servers?';

    if (servers != null) {
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            if (!server.hostname.valid){
                errors.push(invalid_host);
                return;
            }
        }
    }

    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (!sensor.hostname.valid){
                errors.push(invalid_host);
                return;
            }
        }
    }
}

function _validateSensorAndServerCounts(control: AbstractControl, errors: Array<string>): void {
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;

    if (servers != null) {
        if (servers.length < 1){
            errors.push('- Invalid server count. You should have at least one server defined.');
        }
    }

    if (sensors != null) {
        if (sensors.length < 1){
            errors.push('- Invalid sensor count. You should have at least one sensor defined.');
        }
    }
}

/**
 * Validates IPs on KitForm page to ensure that a user does not have duplicate IPs for both sensors or servers.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateIps(control: AbstractControl, errors: Array<string>): void {
    let servers = control.get('servers') as ServersFormArray;
    let sensors = control.get('sensors') as SensorsFormArray;
    let ips: Array<string> = [];

    if (servers != null) {
        for (let i = 0; i < servers.length; i++) {
            let server = servers.at(i) as ServerFormGroup;
            ips.push(server.host_server.value);
        }
    }

    if (sensors != null) {
        for (let i = 0; i < sensors.length; i++) {
            let sensor = sensors.at(i) as SensorFormGroup;
            ips.push(sensor.host_sensor.value);
        }
    }

    for (let i = 0; i < ips.length; i++) {
        let ipA = ips[i];

        for (let x = (i + 1); x < ips.length; x++) {
            let ipB = ips[x];

            if (ipA == ipB){
                errors.push('- Duplicate ips have been detected. Please make sure you do not have duplicate ips in your form.')
                return;
            }
        }
    }
}

function _validate_ceph_drive_count(control: AbstractControl, errors: Array<string>) {
    let kitForm = control as KitInventoryForm;
    if (kitForm === undefined || kitForm === null || kitForm.system_resources === undefined){
        return;
    }
    let number_of_ceph_drives = kitForm.system_resources.totalCephDrives;
    // console.log(number_of_ceph_drives);
    if (number_of_ceph_drives < CEPH_DRIVE_MIN_COUNT) {
        kitForm.system_resources.totalCephDrivesCss = "text-danger";
        kitForm.system_resources.totalCephDrivesErrors = ' - Error: You need at least two drives in the Ceph cluster!';
    } else {
        kitForm.system_resources.totalCephDrivesCss = "text-success";
        kitForm.system_resources.totalCephDrivesErrors = ' - Looks good!';
    }
}

function _validate_endgame_ip(control: AbstractControl){
    let kitForm = control as KitInventoryForm;
    if (kitForm === undefined || kitForm === null || kitForm.endgame_warning === undefined){
        return;
    }
    if (kitForm.endgame_iporhost.value === null || kitForm.endgame_iporhost.value === "" ||
        kitForm.endgame_username.value === null || kitForm.endgame_username.value === "" ||
        kitForm.endgame_password.value === null || kitForm.endgame_password.value === ""){
        kitForm.endgame_warning = "- Endgame IP, Username and/or Password fields are not set.  Without these being set, Endgame will not be integrated with this Kit configuration.";
    } else {
        kitForm.endgame_warning = null;
    }
}

/**
 * The main exported function that performs all the Form Level validation for the KitForm.
 *
 * @param control - The KitForm Group
 * @returns - A array of error messages if there are errors.
 */
export function ValidateKitInventory(control: AbstractControl): { errors: Array<string> } {
    let errors: Array<string> = [];
    _validateMonitorInterfaces(control, errors);
    _validateCephDriveCount(control, errors);
    _validate_pcap_drives(control, errors);
    _validateMasterServer(control, errors);
    _validateKubernetesCIDR(control, errors);
    _validateHomeNet(control, errors);
    _validateExternalNet(control, errors);
    _validateHosts(control, errors);
    _validateIps(control, errors);
    _validateSensorAndServerCounts(control, errors);
    _validate_ceph_drive_count(control, errors);
    _validate_endgame_ip(control);
    CheckForInvalidControls(control, errors);

    if (errors.length > 0){
        return { errors: errors};
    }

    return null;
}
