import { FormGroup } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { IP_CONSTRAINT, INVALID_FEEDBACK_IP } from '../frontend-constants';

export class AgentBuilderForm extends FormGroup {
    
    constructor() {
        super({});
        super.addControl('pf_sense_ip', this.pf_sense_ip);
        super.addControl('winlogbeat_port', this.winlogbeat_port);
        super.addControl('grr_port', this.grr_port);
    }
  
    pf_sense_ip = new HtmlInput(
        'pf_sense_ip',
        'PF Sense firewall IP',
        "Enter your kit's gateway here",
        'text',
        IP_CONSTRAINT,
        INVALID_FEEDBACK_IP,
        true,
        "",
        "The IP address of the PF sense firewall that shields the DIP.  It is important to note \
        that all communication from outside of the DIP must go through this firewall and the administrator must \
        enable port forwarding to the appropriate kubectl services.")
  
    winlogbeat_port = new HtmlInput(
        'winlogbeat_port',
        'Winlogbeat Port',
        "",
        'number',
        undefined,
        'Please enter a valid port number.',
        true,
        "5044",
        "The PF Sense firewall port for Winlogbeat communications. The PF Sense firewall port on this form needs \
        to be port forwarded to the Logstash service inside of the DIP.")

    grr_port = new HtmlInput(
        'grr_port',
        'Google Rapid Response Port',
        "",
        'number',
        undefined,
        'Please enter a valid port number.',
        true,
        "8080",
        "The PF Sense port for Google Rapid Response communications. The PF Sense firewall port on this form needs \
        to be port forwarded to the Google Rapid Response service inside of the DIP.")
}