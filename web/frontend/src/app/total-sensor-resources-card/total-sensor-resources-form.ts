import { FormGroup, FormArray } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { CIDR_CONSTRAINT } from '../frontend-constants';

export class HomeNetFormGroup extends FormGroup {
    constructor() {
        super({});
        super.addControl('home_net', this.home_net);
    }

    home_net = new HtmlInput(
        'home_net',
        'Home Net CIDR IP',
        "Enter your home net CIDR IP here.",
        'text',
        CIDR_CONSTRAINT,
        'You must enter a CIDR IP in the x.x.x.x/xx format.',
        true,
        '',
        "These are the values Bro and Suricata will use for their home nets. Home Nets \
         are the networks you are trying to protect.",
        undefined,
        undefined,
        true,
        'Remove',
        'btn btn-danger'
    )

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.home_net.enable();
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.home_net.disable();
    }

    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.enable();
    }    
}

export class ExternalNetFormGroup extends FormGroup {
    constructor() {
        super({});
        super.addControl('external_net', this.external_net);
    }

    external_net = new HtmlInput(
        'external_net',
        'External Net CIDR IP',
        "Enter your external net CIDR IP here.",
        'text',
        CIDR_CONSTRAINT,
        'You must enter a CIDR IP in the x.x.x.x/xx format.',
        true,
        '',
        "This will define the EXTERNAL_NET variable for all Suricata rules, essentially defining what Suricata sees as the external network. \
        The default setting is \"!HOME_NET\", which means Suricata will define anything that is not HOME_NET as EXTERNAL_NET. It is recommended \
        to keep this setting, but if you need to fine tune your Suricata installation then this could be useful.",
        undefined,
        undefined,
        true,
        'Remove',
        'btn btn-danger'
    )

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.external_net.enable();
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.external_net.disable();
    }

    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.enable();
    }
}

/**
 * Main class which tracks the total resources for all of the sensors.
 */
export class SensorResourcesForm extends FormGroup {
    //These fields are not part of the form but they displayed on the componets interface.
    isDisabled: boolean;
    cpuCoresAvailable: number;
    memoryAvailable: number;        

    //A cached value that we track for other calculations.
    private _lowest_cpus: number;

    constructor() {
        super({});
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;
        super.addControl('home_nets', this.home_nets);
        super.addControl('external_nets', this.external_nets);
        this.addHomeNet();
        this._lowest_cpus = -1;
        this.isDisabled = false;
    }

    /**
     * Overridden method
     */
    reset(value?: any, options?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.reset({});
        this.cpuCoresAvailable = 0;
        this.memoryAvailable = 0;        
        this.clearHomeNets();
        this.clearExternalNets();        
        this.home_nets.reset();
        this.isDisabled = false;
    }

    disable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        this.home_nets.disable();
        this.external_nets.disable();
        this.isDisabled = true;
        super.enable
    }

    enable(opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        super.enable(opts);
        this.isDisabled = false;
    }

    private clearHomeNets(){
        while (this.home_nets.length !== 0) {
            this.home_nets.removeAt(0);
        }
    }

    private clearExternalNets(){
        while (this.external_nets.length !== 0) {
            this.external_nets.removeAt(0);
        }
    }

    private setLowestCpus(lowest_cpus: number){
        this._lowest_cpus = lowest_cpus - 1;
    }

    public getLowestCpus(){
        return this._lowest_cpus;
    }

    /**
     * Called when a user clicks on the "Gather Facts" button on a given sensor
     *
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public setFromDeviceFacts(deviceFacts: Object) {
        if (this._lowest_cpus == -1){
            this.setLowestCpus(deviceFacts["cpus_available"]);
        } else if (this._lowest_cpus > deviceFacts["cpus_available"]){
            this.setLowestCpus(deviceFacts["cpus_available"]);
        }

        this.cpuCoresAvailable += deviceFacts["cpus_available"];
        this.memoryAvailable += deviceFacts["memory_available"];        
    }

    /**
     * Called when we remove a sensor from the kit inventory list.
     *
     * @param deviceFacts - The Ansible JSON object returned from the REST API.
     */
    public subtractFromDeviceFacts(deviceFacts: Object){
        if(this.cpuCoresAvailable > 0){
            this.cpuCoresAvailable -= deviceFacts["cpus_available"];
        }
        
        if (this.memoryAvailable > 0){
            this.memoryAvailable -= deviceFacts["memory_available"];
        }
    } 

    /**
     * Adds a HomeNet FormGroup.
     */
    public addHomeNet(){
        this.home_nets.push(new HomeNetFormGroup());
    }

    /**
     * Removes a HomeNet FormGroup from the homeNets Array by index.
     * At least home net is required so we do not allow deletion of the
     * last homenet.
     *
     * @param index
     */
    public removeHomeNet(index: number){
        if (this.home_nets.length > 1){
            this.home_nets.removeAt(index);
        }
    }

    /**
     * Adds a HomeNet FormGroup.
     */
    public addExternalNet(){
        this.external_nets.push(new ExternalNetFormGroup());
    }

    /**
     * Removes a External Net FormGroup from the external_nets Array by index.
     * At one external net is required so we do not allow deletion of the
     * last homenet.
     *
     * @param index
     */
    public removeExternalNet(index: number){
        this.external_nets.removeAt(index);
    }

    home_nets = new FormArray([]);
    external_nets = new FormArray([]);
}
