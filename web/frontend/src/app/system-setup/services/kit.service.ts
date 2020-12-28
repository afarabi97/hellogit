import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { KitFormClass } from '../../classes';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { HTTP_OPTIONS } from '../../globals';
import { KitFormInterface } from '../../interfaces';
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { kit_validators, KitForm, KitFormNode, ValidateServerCpuMem } from '../kit/kit-form';


@Injectable({
  providedIn: 'root'
})
export class KitService {
  public system_name = "DIP";
  constructor(private http: HttpClient,
    private snackbarWrapper: SnackbarWrapper,
    private formBuilder: FormBuilder,
    private system_nameSrv: WeaponSystemNameService
  ) {}

  getKitForm(): Observable<any> {
    const url = '/api/kit';
    return this.http.get<KitFormInterface>(url)
                    .pipe(map((response: KitFormInterface) => new KitFormClass(response)), catchError(() => of(undefined)));
  }

  private processKitForm(kitForm: Object, kickstartForm: Object){
    //TODO this is horrible and should be refactored in kit.componet.ts
    for (const kickNode of kickstartForm['nodes']){
      for (const node of kitForm['nodes']){
        // let kickHostname = kickNode["hostname"] + "." + kickstartForm["domain"];
        if (kickNode["hostname"] == node['hostname']){
          node['hostname'] = kickNode["hostname"];
          node['pxe_type'] = kickNode['pxe_type'];
          node['os_raid'] = kickNode['os_raid'];
          node['mac_address'] = kickNode['mac_address'];
          node['ip_address'] = kickNode['ip_address'];
          node['error'] = '';
          node['_id'] = kickNode['_id'];

          node['boot_drives'] = kickNode['boot_drives'];
          node['os_raid'] = kickNode['os_raid'];
          node['os_raid_root_size'] = kickNode['os_raid_root_size'];
          node['raid_drives'] = kickNode['raid_drives'];
          node['data_drives'] = kickNode['data_drives'];
        }
      }
    }
    delete kitForm['remove_node'];
  }

  executeKit(kitForm: Object, kickstartForm: Object) {
    const url = '/api/kit';
    this.processKitForm(kitForm, kickstartForm);
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  generateKit(kitForm: Object, kickstartForm: Object) {
    const url = '/api/generate-kit-inventory';
    this.processKitForm(kitForm, kickstartForm);
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  executeAddNode(kitForm: Object) {
    const url = '/api/kit';
    return this.http.put(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  executeRemoveNode(kitForm: Object) {
    const url = '/api/execute_remove_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  /**
   * @param error - optional value to return as the observable result
   */
  public handleError(result: HttpErrorResponse ) {
    if (result.error && result.error["error_message"]){
      this.snackbarWrapper.showSnackBar(result.error["error_message"], -1, 'Dismiss');
    } else {
      this.snackbarWrapper.showSnackBar(result.message, -1, 'Dismiss');
    }
    return new Observable();
  }

  /**
   * adds the sensor controls
   *
   * @private
   * @param {FormGroup} genericNode
   * @memberof KitFormComponent
   */
  private addSensorControls(genericNode: FormGroup): void {
    // remove Server Controls
    if (genericNode.get('is_master_server')) {
      genericNode.removeControl('is_master_server');
    }
  }


  /**
   * adds server controls
   *
   * @private
   * @param {FormGroup} genericNode
   * @memberof KitFormComponent
   */
  private addServerControls(genericNode: FormGroup, value, node, addNode?: boolean): void {
    genericNode.addControl('is_master_server', new FormControl(value ? value : false));
    // set the node to false because otherwise
    if (value) {
      node["is_master_server"] = false;
    }
    if (addNode) {
      genericNode.addControl('is_add_node', new FormControl(true));
    }
  }

  /**
   * adds additional controls based on node_type
   *
   * @private
   * @param {string} value
   * @param {FormGroup} genericNode
   * @param {KitFormNode} node
   * @memberof KitFormComponent
   */
  private addNodeControls(value: string, genericNode: FormGroup, node: KitFormNode, addNode?: boolean): void {
    if (value === 'Sensor') {
      this.addSensorControls(genericNode);
    }
    if (value === 'MIP') {
      this.addServerControls(genericNode, node, addNode); //added MIP node control based on server values
    }
    else if (value === 'Server') {
      this.addServerControls(genericNode, node.is_master_server, node, addNode);
    }
  }

  /**
   *  returns a new Node FormGroup
   *
   * @private
   * @param {*} node
   * @returns
   * @memberof KitFormComponent
   */
  public newKitNodeForm(node, addNode?: boolean): FormGroup {
    let default_node_type;

    if(this.system_name === 'GIP') {
      default_node_type = 'Server';
    }

    if(this.system_name === 'DIP') {
      default_node_type = '';
    }

    let genericNode = this.formBuilder.group({
      node_type: new FormControl(node && node.node_type ? node.node_type : default_node_type, Validators.compose([validateFromArray(kit_validators.node_type)])),
      hostname: new FormControl(node ? node.hostname : ''),
      ip_address: node ? node.ip_address ? node.ip_address : node.default_ipv4_settings.address : '',
      deviceFacts: node && node.deviceFacts ? node.deviceFacts : node,
      error: node && node.error ? node.error : undefined
    });

    if (this.system_name === 'DIP') {
      // This way of changing controls causes an "Expression has changed after it was checked" error when you are in development mode.
      genericNode.get('node_type').valueChanges.subscribe(value => this.addNodeControls(value, genericNode, node, addNode));
    }

    if (this.system_name === 'GIP') {
      this.addNodeControls('Server', genericNode, node, addNode);
    }

    return genericNode;
  }


  /**
   * returns a new KitFormGroup
   *
   * @private
   * @param {*} [kitForm]
   * @returns {FormGroup}
   * @memberof KitFormComponent
   */

  public newKitFormGroup(kitForm?: KitForm, isDisabled = true): FormGroup {

    const kitFormGroup = this.formBuilder.group({
      nodes: this.formBuilder.array([]),
      kubernetes_services_cidr: new FormControl(kitForm ? kitForm.kubernetes_services_cidr : '',
        Validators.compose([validateFromArray(kit_validators.kubernetes_services_cidr)])),
      remove_node: new FormControl('')
    });

    this.system_name = this.system_nameSrv.getSystemName();

    //Cycle validation messages per system name/ type

    if (this.system_name == 'GIP') {
      kitFormGroup.setValidators(Validators.compose([
        validateFromArray(kit_validators.kit_form_one_server, { minRequired: 2, minRequiredValue: 'Server', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
        ValidateServerCpuMem
      ]));
    };
    if (this.system_name == 'DIP') {
      kitFormGroup.setValidators(Validators.compose([
        validateFromArray(kit_validators.kit_form_one_master, { minRequired: 1, minRequiredValue: true, minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'is_master_server' }),
        validateFromArray(kit_validators.kit_form_one_sensor, { minRequired: 1, minRequiredValue: 'Sensor', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
        validateFromArray(kit_validators.kit_form_one_server, { minRequired: 2, minRequiredValue: 'Server', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
        ValidateServerCpuMem
      ]));
    };
    if (this.system_name =='MIP') {
      kitFormGroup.setValidators(Validators.compose([
        ValidateServerCpuMem
      ]));
    };

    if (kitForm) {
      const nodes = kitFormGroup.get('nodes') as FormArray;
      kitForm.nodes.map(node => nodes.push(this.newKitNodeForm(node)));
      if (isDisabled) {
        nodes.disable();
        kitFormGroup.disable();
      }
    }
    return kitFormGroup;
  }
}
