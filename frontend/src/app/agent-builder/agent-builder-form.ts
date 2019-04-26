import { FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HtmlInput, HtmlCheckBox, HtmlCardSelector } from '../html-elements';
import { IP_CONSTRAINT, INVALID_FEEDBACK_IP } from '../frontend-constants';
import { EndgameService } from '../endgame.service'

export interface labeledAbstractControl extends AbstractControl {
    label: string;
}

export class AgentBuilderForm extends FormGroup {
    constructor(private endgameSrv: EndgameService) {
        super({})
        this.addControl('pf_sense_ip', this.pf_sense_ip);
        this.addControl('install_sysmon', this.install_sysmon);
        this.addControl('install_winlogbeat', this.install_winlogbeat);
        this.addControl('install_endgame', this.install_endgame);
        this.addControl('endgame_server_ip', this.endgame_server_ip);
        this.addControl('endgame_port', this.endgame_port);
        this.addControl('endgame_user_name', this.endgame_user_name);
        this.addControl('endgame_password', this.endgame_password);
        this.addControl('endgame_sensor_name', this.endgame_sensor_name);
        this.addControl('endgame_persistence',this.endgame_persistence);
        this.addControl('endgame_sensors',this.endgame_sensors);
        this.addControl('endgame_sensor_ip', this.endgame_sensor_ip);
        this.addControl('endgame_vdi', this.endgame_vdi);

        this.endgame_sensor_name.setValidators(this.validateSensorNameForm);

        this.getEndgameSensorProfiles();
        this.setValidators(checkForSufficientData);

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
        enable port forwarding to the appropriate kubectl services.")

    install_winlogbeat = new HtmlCheckBox(
        'add_winlogbeat',
        'Install Winlogbeat',
        'Add a Winlogbeat agent installer.',
        false,
        true )

    install_endgame = new HtmlCheckBox(
        'add_endgame',
        'Install Endgame',
        'Add an Endgame sensor agent installer.',
        false,
        true )

    endgame_server_ip = new HtmlInput(
        'endgame_server_ip',
        'Endgame Server IP',
        "Enter your Endgame server IP here",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        "",
        "The IP address of the Endgame server (behind the firewall)."
    )

    endgame_sensor_ip = new HtmlInput(
        'endgame_sensor_ip',
        'Endgame Transceiver IP',
        "Indicates the IP address where the selected sensor will send data.",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        false,
        "",
        "Indicates the IP address where the selected sensor will send data."
    )

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
        to be port forwarded to the Endgame service inside of the DIP.")

    endgame_user_name = new HtmlInput(
        'endgame_user_name',
        'Endgame User Name',
        'Enter your Endgame user name here',
        'text',
        undefined,
        'Must enter a user name.',
        true,
        '',
        'Endgame account user name')

    endgame_password = new HtmlInput(
        'endgame_password',
        'Endgame Password',
        'Enter your Endgame password here',
        'password',
        undefined,
        'Must enter a password.',
        true,
        '',
        'Endgame account password')

    endgame_sensor_name = new HtmlInput(
        'endgame_sensor_name',
        'Endgame Sensor Profile',
        'TFPlenum Sensor Profile',
        'text',
        undefined,
        'Must enter a sensor name.',
        true,
        'TFPlenum Sensor',
        'Name of the new Endgame sensor profile. (Cannot be name of existing sensor profile.)')

    endgame_vdi = new HtmlCheckBox(
        'endgame_vdi',
        'VDI Compatibility',
        'Select if sensor should be VDI compatible',
        false,
        false)

    endgame_persistence = new HtmlCardSelector(
        'endgame_persistence',
        "Endgame Sensor Persistence",
        "Set whether sensors should be persistent, for continuous montitorins and explorations; \
         or dissolvable, for short-term hunt missions",
        "Persistent for continuous monitoring, dissolvable for short-term hunts",
        "Select One",
        "Invalid",
        false,
        undefined,
        undefined,
        [{value: "Persistent", label: "Persistent", isSelected: true},
         {value: "Dissolvable", label: "Dissolvable", isSelected: false}]);

    endgame_sensors= new HtmlCardSelector(
        'endgame_sensors',
        "Endgame Sensor Profiles",
        "List of existing sensor profiles. Select one to use an existing profile, or fill in a profile description in \
            the forms below",
        "Sensor Profiles",
        "Select One (optional)",
        "Invalid",
        false,
        undefined,
        true,
        []);

    endgameControls:labeledAbstractControl[] = [
            this.endgame_server_ip,
            this.endgame_port,
            this.endgame_user_name,
            this.endgame_password,
            this.endgame_sensor_name,
            this.endgame_persistence,
            this.endgame_vdi,
            this.endgame_sensors
        ]

    enableEndgameControls() {
        this.endgameControls.forEach( (ctrl) => {
            if(this.install_endgame.value) {
                ctrl.enable()
            }
            else {
                ctrl.disable()
            }
        })
    }


    install_sysmon = new HtmlCheckBox(
        'add_sysmon',
        'Install Sysmon',
        'Add a Sysmon agent installer.',
        false,
        true )

    notification_text:string = "";
    sufficient_data_to_build_agents:boolean=false;
    errors:   { [id: string]: string} = {}
    endgame_server_reachable: boolean = false;

    endgame_sensor_profiles = [];
    /**
    * This method checks that all Endgame server parameters; IP address,
    * username, and password, are valid and if so, if they are correct, i.e.,
    * can be used to access Endgame server and get info about sensor profiles.
    */
    getEndgameSensorProfiles() {
        this.endgame_server_reachable = false;
        if(this.endgame_server_ip.valid && this.endgame_user_name.valid && this.endgame_password.valid) {
            this.endgameSrv.getEndgameSensorProfiles(this.getRawValue()).subscribe(
                profile_data => {
                    this.endgame_server_reachable = true;
                    this.endgame_sensor_profiles = profile_data;
                    this.addEndgameSensorsToSelector();
                },
                err => {
                    this.endgame_server_reachable = false;
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

    validateSensorNameForm = (nameForm: HtmlInput) : ValidationErrors | null => {
        if(this.endgame_sensors.value.length > 0) {
            return null;
        }
        let name = nameForm.value;
        if(nameForm.enabled && this.endgame_sensors.default_options.length != 0) {
            for(let sensor of this.endgame_sensors.default_options) {
                if(sensor['value'] === name) {
                    return { 'Endgame sensor name in use' : name };
                }
            }
        }
        if(name.length < 1) {
            return { 'Endgame sensor name too short': name.length }
        }
        return null;
    }
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
export function checkForSufficientData(ab_form: AgentBuilderForm): ValidationErrors | null {
    ab_form.errors = {};
    ab_form.sufficient_data_to_build_agents = false;

    if(!ab_form.pf_sense_ip.valid) {
        ab_form.errors['Firewall IP'] =  'Invalid value'
    }

    if(!(ab_form.install_sysmon.value || ab_form.install_winlogbeat.value || ab_form.install_endgame.value)) {
        ab_form.errors['Installers'] = 'No installer selected'
    }

    if(ab_form.install_endgame.value) {
        for(let ctrl of ab_form.endgameControls) {
            if(!ctrl.valid) {
                if( Object.keys(ctrl.errors).length > 0) {
                    ab_form.errors[ctrl.label] = Object.keys(ctrl.errors)[0] + ": "
                        + ctrl.errors[Object.keys(ctrl.errors)[0]];
                } else {
                    ab_form.errors[ctrl.label] = 'Invalid Value';
                }
            }
        }
        if( ab_form.endgame_persistence.controls.length == 0 )
        {
            ab_form.errors['Endgame Persistence'] = 'Not set'
        }
        if(!ab_form.endgame_server_reachable) {
             ab_form.errors['Endgame Server'] =
                'Cannot reach Endgame server. Check IP address, username and password.'
        }
    }

    if (Object.keys(ab_form.errors).length === 0) {
        ab_form.sufficient_data_to_build_agents = true;
        return null
    }


    return ab_form.errors
}
