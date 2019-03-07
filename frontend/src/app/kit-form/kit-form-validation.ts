import {  FormArray, AbstractControl } from '@angular/forms';
import { HtmlDropDown } from '../html-elements';
import { ServerFormGroup, SensorFormGroup, SensorsFormArray, ServersFormArray, KitInventoryForm } from './kit-form';
import { IP_CONSTRAINT } from '../frontend-constants';
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

function _validate_pcap_drives(control: AbstractControl, errors: Array<string>): void {
    let sensors = control.get('sensors') as SensorsFormArray;
    if (sensors != null){
        for (let i = 0; i < sensors.length; i++) {
            let sensor = sensors.at(i) as SensorFormGroup;
            if(sensor.pcap_drives.length !== 1) {
                errors.push("- PCAP drives failed to validate on " + sensor.hostname.value + 
                            ". You need to select one PCAP drive for this sensor.")
            }
        }
    }
}

function _validate_selected_sensor_applications(control: AbstractControl, errors: Array<string>): void {
    let sensors = control.get('sensors') as SensorsFormArray;
    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if(sensor.sensor_apps.length < 1){
                errors.push("- Sensor applications failed to validate on " + sensor.hostname.value + 
                            ". You need to select at least one application.")
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
    if (sensors != null){
        for (let i = 0; i < sensors.length; i++){
            let sensor = sensors.at(i) as SensorFormGroup;
            if (sensor.monitor_interface.length == 0) {
                errors.push("- Monitor interfaces failed to validate on " + sensor.hostname.value + 
                            ". You need to select at least one monitor interface on each sensor.");
                break;
            }
        }
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
        const message: string = "- Home nets failed to validate. You need at least one home net.";

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

function _validate_advanced_percentages(control: AbstractControl, errors: Array<string>){
    let kitForm = control as KitInventoryForm;
    if (kitForm === undefined || 
        kitForm === null || 
        kitForm.enable_percentages === undefined ||
        kitForm.enable_percentages.value === null ||
        kitForm.sensors === undefined ||
        kitForm.sensors === null
        ){
        return;
    }    
    if (kitForm.enable_percentages.value){
        for (let i = 0; i < kitForm.sensors.length; i++) {
            let sensor = kitForm.sensors.at(i) as SensorFormGroup;
            if ((parseInt(sensor.bro_cpu_percentage.value) + 
                parseInt(sensor.moloch_cpu_percentage.value) + 
                parseInt(sensor.suricata_cpu_percentage.value)) > 100) {
                errors.push('- Bro, Suricata, and Moloch percentage overrides \
                            cannot exceed 100 on ' + sensor.hostname.value + '.');
            }
        }
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
    _validate_pcap_drives(control, errors);
    _validate_selected_sensor_applications(control, errors);
    _validateMasterServer(control, errors);
    _validateKubernetesCIDR(control, errors);
    _validateHomeNet(control, errors);
    _validateExternalNet(control, errors);
    _validateHosts(control, errors);
    _validateIps(control, errors);
    _validateSensorAndServerCounts(control, errors);    
    _validate_advanced_percentages(control, errors);
    CheckForInvalidControls(control, errors);
    _validate_endgame_ip(control);

    if (errors.length > 0){
        return { errors: errors};
    }

    return null;
}
