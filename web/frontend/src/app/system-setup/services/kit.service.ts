import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from '../../globals';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { catchError } from 'rxjs/operators';
import { FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { KitFormNode, kit_validators, KitForm, ValidateServerCpuMem } from '../kit/kit-form';
import { WeaponSystemNameService } from 'src/app/services/weapon-system-name.service';


@Injectable({
  providedIn: 'root'
})
export class KitService {
  public system_name: any = "DIP";
  constructor(private http: HttpClient,
    private snackbarWrapper: SnackbarWrapper,
    private formBuilder: FormBuilder,
    private system_nameSrv: WeaponSystemNameService
  ) {}

  getKitForm(): Observable<Object> {
    const url = '/api/get_kit_form';
    return this.http.get(url).pipe();
  }

  executeKit(kitForm: Object) {
    const url = '/api/execute_kit_inventory';
    let payload: Object = { 'kitForm': kitForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  generateKit(kitForm: Object) {
    const url = '/api/generate_kit_inventory';
    let payload: Object = { 'kitForm': kitForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError(err))
    );
  }

  executeAddNode(kitForm: Object) {
    const url = '/api/execute_add_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
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
      management_ip_address: node ? node.management_ip_address ? node.management_ip_address : node.default_ipv4_settings.address : '',
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
    let use_proxy_pool = false;

    if (this.system_name === "GIP") {
      use_proxy_pool = true;
    }

    const kitFormGroup = this.formBuilder.group({
      nodes: this.formBuilder.array([]),
      kubernetes_services_cidr: new FormControl(kitForm ? kitForm.kubernetes_services_cidr : '',
        Validators.compose([validateFromArray(kit_validators.kubernetes_services_cidr)])),
      dns_ip: new FormControl(''),
      remove_node: new FormControl(''),
      use_proxy_pool: new FormControl(use_proxy_pool)
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
