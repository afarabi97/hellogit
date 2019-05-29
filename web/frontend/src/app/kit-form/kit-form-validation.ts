import { FormArray, AbstractControl } from '@angular/forms';
import { HtmlDropDown } from '../html-elements';
import { ServerForm, SensorForm, KitNodeFormGroup, KitNodesFormArray, KitInventoryForm } from './kit-form';
import { IP_CONSTRAINT } from '../frontend-constants';
import { CheckForInvalidControls } from '../globals';
import { NodesFormArray } from '../kickstart-form/kickstart-form';

/**
 * Ensures that the user has selected at least one server as a master.
 *
 * @param control - The KitForm Group
 * @param errors - An array of strings to display.
 */
function _validateMasterServer(control: AbstractControl, errors: Array<string>): void {    
    let nodes = control.get('nodes') as KitNodesFormArray;
    if (nodes != null){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;
            if (node instanceof ServerForm){
                if  (node.is_master_server.value){
                    return;
                }
            }
            
        }
    }
    errors.push("- Master server failed to validate. Did you remember to select a master server? (It's the checkbox that says 'Is Kubernetes master server?')");
}

function _validate_esdata_drives(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as KitNodesFormArray;
    if (nodes != null){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;
            if (node instanceof ServerForm){
                if(node.es_drives.length < 1) {
                    errors.push("- ES data drives failed to validate on " + node.hostname.value + 
                                ". You need to select at least one drive for this server.")
                }
            }
        }
    }
}

function _validate_pcap_drives(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as KitNodesFormArray;
    if (nodes != null){
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;
            if (node instanceof SensorForm){
                if(node.pcap_drives.length !== 1) {
                    errors.push("- PCAP drives failed to validate on " + node.hostname.value + 
                                ". You need to select one PCAP drive for this sensor.")
                }
            }
        }
    }
}

function _validate_selected_sensor_applications(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as KitNodesFormArray;
    if (nodes != null){
        for (let i = 0; i < nodes.length; i++){
            let node = nodes.at(i) as KitNodeFormGroup;
            if (node instanceof SensorForm){
                if(node.sensor_apps.length < 1){
                    errors.push("- Sensor applications failed to validate on " + node.hostname.value + 
                                ". You need to select at least one application.")
                }
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
    let nodes = control.get('nodes') as KitNodesFormArray;
    if (nodes != null){
        for (let i = 0; i < nodes.length; i++){
            let node = nodes.at(i) as KitNodeFormGroup;
            if (node instanceof SensorForm){
                if (node.monitor_interface.length == 0) {
                    errors.push("- Monitor interfaces failed to validate on " + node.hostname.value + 
                                ". You need to select at least one monitor interface on each sensor.");
                    break;
                }
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
    let nodes = control.get('nodes') as KitNodesFormArray;
    let invalid_host:string = '- Invalid hostname. Did you forget to click "Gather Facts" on one of your sensors or servers?';

    if (nodes) {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;
            if (!node.hostname.valid){
                errors.push(invalid_host);
                return;
            }
        }
    }
}

function _validateSensorAndServerCounts(control: AbstractControl, errors: Array<string>): void {
    let nodes = control.get('nodes') as KitNodesFormArray;

    if (nodes) {
        let server_count = 0;
        let sensor_count = 0;
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;

            if (node instanceof ServerForm){
                server_count += 1;
            } else if (node instanceof SensorForm){
                sensor_count += 1
            }

        }

        if (server_count < 1){
            errors.push('- Invalid server count. You should have at least one server defined.');
        }

        if (sensor_count < 1){
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
    let nodes = control.get('nodes') as KitNodesFormArray;
    let ips: Array<string> = [];

    if (nodes != null) {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes.at(i) as KitNodeFormGroup;
            ips.push(node.management_ip_address.value);
        }
    }
    
    for (let i = 0; i < ips.length; i++) {
        let ipA = ips[i];

        for (let x = (i + 1); x < ips.length; x++) {
            let ipB = ips[x];

            if (ipA === ipB){
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

function _validate_server_cpu_mem(control: AbstractControl, errors: Array<string>){
    let nodes = control.get('nodes') as NodesFormArray;    
    let ips: Array<string> = [];

    const msg = '- One or more server have differing amounts of CPU cores or memory. Each server is required to have the same hardware!';
    if (nodes != null && nodes.length > 1) {
        outer:
        for (let i = 0; i < nodes.length; i++) {
            let node_i = nodes.at(i) as KitNodeFormGroup;
            if (node_i.deviceFacts === null){
                break;
            }

            if (node_i instanceof SensorForm){
                continue;
            }

            for (let x = 0; x < nodes.length; x++) {
                let node_x = nodes.at(x) as KitNodeFormGroup;
                if (node_x.deviceFacts === null){
                    break;
                }

                if (node_x instanceof SensorForm){
                    continue;
                }

                if (node_i.deviceFacts['cpus_available'] !== node_x.deviceFacts['cpus_available']){
                    errors.push(msg)
                    break outer;
                }

                if (Math.ceil(node_i.deviceFacts['memory_available']) !== Math.ceil(node_x.deviceFacts['memory_available'])){
                    errors.push(msg)
                    break outer;
                }
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
    _validate_esdata_drives(control, errors);
    _validate_pcap_drives(control, errors);
    _validate_selected_sensor_applications(control, errors);
    _validateMasterServer(control, errors);
    _validateKubernetesCIDR(control, errors);
    _validateHomeNet(control, errors);
    _validateExternalNet(control, errors);
    _validateHosts(control, errors);
    _validateIps(control, errors);
    _validateSensorAndServerCounts(control, errors);
    _validate_server_cpu_mem(control, errors);
    CheckForInvalidControls(control, errors);
    _validate_endgame_ip(control);

    if (errors.length > 0){
        return { errors: errors};
    }

    return null;
}
