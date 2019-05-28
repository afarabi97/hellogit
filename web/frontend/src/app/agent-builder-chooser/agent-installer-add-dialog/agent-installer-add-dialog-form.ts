import { FormGroup, ValidationErrors } from "@angular/forms";
import { EndgameService } from "src/app/endgame.service";
import { LoginForm } from "src/app/login-form";
import { HtmlInput, HtmlCheckBox, HtmlCardSelector } from "src/app/html-elements";
import { INVALID_FEEDBACK_IP, IP_CONSTRAINT } from "src/app/frontend-constants";
import { AgentInstallerConfig } from "src/app/agent-builder.service";

export class AgentInstallerAddDialogForm extends FormGroup {
    saved_configs: Array<AgentInstallerConfig> = [];
    endgameSrv: EndgameService;
    winlogbeat_arch: string = '';
    

    constructor() {
        super({});
        super.addControl('pf_sense_ip', this.pf_sense_ip);
        super.addControl('install_sysmon', this.install_sysmon);
        super.addControl('install_winlogbeat', this.install_winlogbeat);
        super.addControl('install_endgame', this.install_endgame);
        super.addControl('endgame_port', this.endgame_port);
        super.addControl('endgame_sensors',this.endgame_sensors);
        super.addControl('config_name', this.config_name);

        super.setValidators(checkForSufficientData);
    }

    endgame_credentials: LoginForm;
    setEndgameCredentials(endgame_credentials: LoginForm) {
        this.endgame_credentials = endgame_credentials;
        super.addControl('endgame_server_ip', endgame_credentials.get('server_ip'));
        super.addControl('endgame_user_name', endgame_credentials.get('user_name'));
        super.addControl('endgame_password', endgame_credentials.get('password'));
        this.getEndgameSensorProfiles();
    }

    pf_sense_ip = new HtmlInput(
        'pf_sense_ip',
        'PF Sense Firewall IP',
        "Enter your kit's gateway here",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        "",
        "The IP address of the PF sense firewall that shields the DIP.  It is important to note \
        that all communication from outside of the DIP must go through this firewall and the administrator must \
        enable port forwarding to the appropriate kubectl services.");
    

    install_winlogbeat = new HtmlCheckBox(
        'add_winlogbeat',
        'Install Winlogbeat Agent',
        'Add a Winlogbeat agent installer.',
        false,
        true );

    install_endgame = new HtmlCheckBox(
        'add_endgame',
        'Install Endgame Agent',
        'Add an Endgame sensor agent installer.',
        false,
        true );

    endgame_port = new HtmlInput(
        'endgame_port',
        'Endgame Port',
        "",
        'number',
        undefined,
        'Please enter a valid port number.',
        true,
        "443",
        "The PF Sense firewall port for Endgame communications. The PF Sense firewall port on this form needs \
        to be port forwarded to the Endgame service inside of the DIP.");

    endgame_sensors= new HtmlCardSelector(
        'endgame_sensors',
        "Endgame Sensor Profiles",
        "List of existing sensor profiles. Select one.",
        "Sensor Profiles",
        "Select One", 
        "Invalid",
        false,
        undefined,
        true,
        []);

    config_name = new HtmlInput(
        'config_name',//form_name
        'Configuration Name',//label
        'Enter name to save configuration',//placeholder
        'text',//input_type
        undefined,//TODO: write validation function for checking existing names
        'invalid',//invalid_feedback
        true,//required
        '',//default_value
        'Name to save the agent installer configuration');//description


    enableEndgameControls() {
        if(this.install_endgame.value) {
            this.endgame_sensors.enable();
            this.get('endgame_server_ip').enable();
            this.get('endgame_user_name').enable();
            this.get('endgame_password').enable();
            this.endgame_port.enable();
        } else {
            this.endgame_sensors.disable();
            this.get('endgame_server_ip').disable();
            this.get('endgame_user_name').disable();
            this.get('endgame_password').disable();
            this.endgame_port.disable();
        }
    }

    install_sysmon = new HtmlCheckBox(
        'add_sysmon',
        'Install Sysmon',
        'Add a Sysmon agent installer.',
        false,
        true );

    notification_text:string = "";
    sufficient_data_to_build_agents:boolean=false;
    errors:   { [id: string]: string} = {};
    endgame_server_reachable: boolean = false;

    endgame_sensor_profiles = [];

    /**
    * This method checks that all Endgame server parameters; IP address,
    * username, and password, are valid and if so, if they are correct, i.e.,
    * can be used to access Endgame server and get info about sensor profiles.
    */
    getEndgameSensorProfiles() {
        this.endgame_server_reachable = false;
        if(this.endgame_credentials.get('password').valid &&
           this.endgame_credentials.get('server_ip').valid &&
           this.endgame_credentials.get('user_name').valid ) {
                this.endgameSrv.getEndgameSensorProfiles(this.getRawValue()).subscribe(
                profile_data => {
                    this.endgame_server_reachable = true;
                    this.endgame_sensor_profiles = profile_data;
                    this.addEndgameSensorsToSelector();
                },
                err => {
                    this.endgame_server_reachable = false;
                    console.error("Could not reach Endgame server");
                }
            );
        }
        checkForSufficientData(this);
    }

    addEndgameSensorsToSelector() {
        let sensor_names = [];
        for(let p of this.endgame_sensor_profiles) {
            let name = p['name'];
            sensor_names.push({value: name, label: name, isSelected: false});
        }
        this.endgame_sensors.default_options = sensor_names;
    }

    onWlbArchSelect(arch: string) {
      this.winlogbeat_arch = arch;
      checkForSufficientData(this);
    }


}

export function checkConfigName(frm: HtmlInput): null | ValidationErrors {
    let name = frm.value;
    if(name.length < 1) {
        return { 'Config Name': 'Required Value' }
    }

    let dialog_form = frm.parent as AgentInstallerAddDialogForm;
    let match = dialog_form.saved_configs.find(elem => {
        return elem.config_name === name;
    });
    if(match != undefined) {
        return { 'Config Name in Use': name }
    }
    return null;
}

/**
 * This function checks if an AgentBuilderForm has enough data to build the
 * selected agent installers.
 *
 * The function is treated as a custom validator to ensure it is called at the
 * right times, but the HtmlInputControls set the validity of their parent
 * forms, so it doesn't actually set the validity.
 *
 * The function sets the AgentBuilderFrom.sufficient_data_to_build_agents
 * flag.
 * @param ab_form Form to be checked
 */
export function checkForSufficientData(ab_form: AgentInstallerAddDialogForm): ValidationErrors | null {
    ab_form.errors = {};
    ab_form.sufficient_data_to_build_agents = false;

    if(!ab_form.pf_sense_ip.valid) {
        ab_form.errors['Firewall IP'] =  'Invalid value';
    }

    if(!(ab_form.install_sysmon.value || ab_form.install_winlogbeat.value || ab_form.install_endgame.value)) {
        ab_form.errors['Installers'] = 'No installer selected';
    }

    if(ab_form.install_endgame.value) {
        if(!ab_form.endgame_server_reachable) {
             ab_form.errors['Endgame Server'] =
                'Cannot reach Endgame server. Check IP address, username and password.';
        }
        if(Object.keys(ab_form.endgame_sensors.value).length == 0) {
            ab_form.errors['Endgame Profile'] = 'Select Endgame Profile';
        }
    }
    
    if(!ab_form.config_name.valid) {
        if(ab_form.config_name.errors['required']) {
            delete ab_form.config_name.errors['required'];
            ab_form.errors['Config Name'] = 'Required Value';
        } else {
            ab_form.errors = Object.assign({}, ab_form.errors, ab_form.config_name.errors);
        }
    }

    if(ab_form.install_winlogbeat.value && ab_form.winlogbeat_arch.length == 0) {
        ab_form.errors['Winlogbeat Architecture'] = 'Required Value';
    }

    if (Object.keys(ab_form.errors).length === 0) {
        ab_form.sufficient_data_to_build_agents = true;
        return null;
    }

    return ab_form.errors;
}
