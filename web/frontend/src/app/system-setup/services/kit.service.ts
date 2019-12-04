import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from '../../globals';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { catchError } from 'rxjs/operators';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { KitFormNode, kit_validators } from '../kit/kit-form';


@Injectable({
  providedIn: 'root'
})
export class KitService {

  constructor(private http: HttpClient,
              private snackbarWrapper: SnackbarWrapper,
              private formBuilder: FormBuilder
              ) { }

  getKitForm(): Observable<Object> {
    const url = '/api/get_kit_form';
    return this.http.get(url).pipe();
  }

  executeKit(kitForm: Object, timeForm: Object) {
    const url = '/api/execute_kit_inventory';
    let payload: Object = { 'kitForm': kitForm, 'timeForm': timeForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  generateKit(kitForm: Object, timeForm: Object) {
    const url = '/api/generate_kit_inventory';
    let payload: Object = { 'kitForm': kitForm, 'timeForm': timeForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  executeAddNode(kitForm: Object) {
    const url = '/api/execute_add_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  executeRemoveNode(kitForm: Object) {
    const url = '/api/execute_remove_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  public handleError(operation = 'operation', result?) {
    return (error: any): Observable<any> => {
      this.snackbarWrapper.showSnackBar('An error has occured: ' + error.status + '-' + error.statusText, -1, 'Dismiss');
      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }

  /**
   * adds the sensor controls
   *
   * @private
   * @param {FormGroup} genericNode
   * @memberof KitFormComponent
   */
  private addSensorControls(genericNode: FormGroup, value): void {
    genericNode.addControl('is_remote', new FormControl(value ? value : false));
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
    // remove Server Controls
    if (genericNode.get('is_remote')) {
      genericNode.removeControl('is_remote');
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
      this.addSensorControls(genericNode, node.is_remote);
    } else if (value === 'Server') {
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
    let genericNode = this.formBuilder.group({
      node_type: new FormControl(node && node.node_type ? node.node_type : '', Validators.compose([validateFromArray(kit_validators.node_type)])),
      hostname: new FormControl(node ? node.hostname : ''),
      management_ip_address: node ? node.management_ip_address ? node.management_ip_address : node.default_ipv4_settings.address : '',
      deviceFacts: node && node.deviceFacts ? node.deviceFacts : node
    });
    genericNode.get('node_type').valueChanges.subscribe(value => this.addNodeControls(value, genericNode, node, addNode));
    return genericNode;
  }

}
