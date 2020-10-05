import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { ConfirmActionPopup } from '../classes/ConfirmActionPopup';
import { DialogFormControl, DialogFormControlConfigClass } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { UserService } from '../user.service';
import { ConfigmapsService } from './configmaps.service';

const DIALOG_WIDTH = '800px';
@Component({
  selector: 'app-configmaps',
  templateUrl: './configmaps.component.html'
})
export class ConfigmapsComponent implements OnInit {

  isConfigMapVisible: Array<boolean>;
  configMaps: Array<Object>;
  isUserEditing: boolean;
  isDeleteConfigMap: boolean;
  isDeleteConfigMapData: boolean;
  loading: boolean;

  activeConfigDataTitle: string;
  activeConfigDataKey: string;
  activeConfigData: string;
  activeConfigMapName: string;
  activeConfigMapIndex: number;

  innerTableColumns = [ "filename", "actions" ]
  outerTableColumns = [ "namespace", "config_name", "creation_date", "actions" ]

  controllerMaintainer: boolean;
  operator: boolean;

  constructor(private configMapSrv: ConfigmapsService, private title: Title,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private formBuilder: FormBuilder,
              private confirmer: ConfirmActionPopup,
              private userService: UserService) {
    this.isUserEditing = false;
    this.isConfigMapVisible = new Array();
    this.configMaps = new Array();
    this.activeConfigDataTitle = "";
    this.activeConfigData = "";
    this.activeConfigMapName = "";
    this.activeConfigMapIndex = -1;
    this.isDeleteConfigMap = false;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
    this.operator = this.userService.isOperator();
   }

  ngOnInit() {
    this.title.setTitle("Config Maps");
    this.loading = true;
    this.configMapSrv.getConfigMaps().subscribe(data => {
      if (data['items']){
        this.configMaps = data['items'];
        this.isConfigMapVisible = new Array(this.configMaps.length).fill(false);
      }
      this.loading = false;
    });
  }

  objectKeys(obj: any) {
    const ret_val = [];
    for (const item of Object.keys(obj)){
        ret_val.push(item);
    }
    return ret_val;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  addConfigMap() {
    const nameSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    nameSpaceFormControlConfig.label = 'Namespace';
    nameSpaceFormControlConfig.formState = '';
    nameSpaceFormControlConfig.validatorOrOpts = [Validators.minLength(3), Validators.required];
    const nameFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    nameFormControlConfig.label = 'Name';
    nameFormControlConfig.formState = '';
    nameFormControlConfig.validatorOrOpts = [
      Validators.minLength(3),
      Validators.required,
      Validators.pattern('^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$')
    ];
    const acdForm = this.formBuilder.group({
      namespace: new DialogFormControl(nameSpaceFormControlConfig),
      name: new DialogFormControl(nameFormControlConfig)
    });

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      data: {
        title: "Add Config Map",
        instructions: "Please fill out the form.",
        dialogForm: acdForm,
        confirmBtnText: "Submit"
      }
    });

    dialogRef.afterClosed().subscribe(
      result => {
        const form = result as FormGroup;
        if(form && form.valid) {
          this.addNewConfigMap(form.getRawValue());
        }
      }
    );
  }

  removeConfigMap(configName: string, config: Object) {
    const configIndex = this._getConfigIndex(config);
    this.isDeleteConfigMap = true;
    this.activeConfigMapIndex = configIndex;
    this.confirmer.confirmAction(
      `Delete ${configName}`,
      `Are you sure you want to delete ${configName}?
      All data entries will be removed and this could cause your system to break if you don't know what you are doing.`,
      "Delete",
      `Deleting ${configName}`,
      `Could not delete ${configName}`,
      () => { this.confirmDeleteSubmission() }
    );

  }

  editConfigMapData(configDataName: string, config: Object){
    const configMapIndex = this._getConfigIndex(config)
    this.activeConfigDataTitle = `Editing ${configDataName}`;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    const metadata = this.configMaps[this.activeConfigMapIndex]['metadata'];
    this.activeConfigMapName = metadata['name'];

    this.configMapSrv.getConfigMap(metadata['namespace'], metadata['name'], this.activeConfigDataKey).subscribe(data => {
      this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = data;
      this.activeConfigData = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    });

    this.isUserEditing = true;
  }

  addNewConfigMapData(formSubmission: Object){
    this.activeConfigDataTitle = `Editing ${formSubmission['name']}`;
    this.activeConfigDataKey = formSubmission['name'];
    if (!this.configMaps[this.activeConfigMapIndex]['data']){
      this.configMaps[this.activeConfigMapIndex]['data'] = {}
    }

    this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = '';
    this.activeConfigData = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.isUserEditing = true;
  }

  addNewConfigMap(formSubmission: Object){
    const newConfigMap = {'metadata': {'name': formSubmission['name'],
                                  'creation_timestamp': '',
                                  'namespace': formSubmission['namespace']},
                     'data': {}};
    this.configMapSrv.createConfigMap(newConfigMap).subscribe(data => {
      this.configMaps.splice(0, 0, data);
      this.isConfigMapVisible.splice(0, 0, true);
      this.displaySnackBar(`Successfully added ${formSubmission['name']}`);
      this.ngOnInit();
    }, error => {
      this.displaySnackBar(`Failed to save configmap. REASON: ${error["statusText"]}`);
    });
  }

  removeConfigMapData(configDataName: string, config: Object){
    const configMapIndex = this._getConfigIndex(config);
    this.isDeleteConfigMapData = true;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    this.confirmer.confirmAction(`Delete ${configDataName}`,
                       "Are you sure you want to remove this data entry from the config map?",
                       "Delete",
                       `Deleting ${configDataName}`,
                       `Could not delete ${configDataName}`,
                       () => { this.confirmDeleteSubmission() });
  }

  addConfigMapData(config: Object){
    const configMapIndex = this._getConfigIndex(config);
    this.activeConfigMapIndex = configMapIndex;
    const nameFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    nameFormControlConfig.label = 'Name';
    nameFormControlConfig.formState = '';
    nameFormControlConfig.validatorOrOpts = [Validators.minLength(3), Validators.required, Validators.pattern('^[A-z_0-9]+$')];
    const acdForm = this.formBuilder.group({
      name: new DialogFormControl(nameFormControlConfig)
    });
    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      data: {
        title: "Add Config Map Data",
        instructions: "Please a name for the config map data.",
        dialogForm: acdForm,
        confirmBtnText: "Submit"
      }
    });
    dialogRef.afterClosed().subscribe(
      result => {
        const form = result as FormGroup;
        if(form && form.valid) {
          this.addNewConfigMapData(form.getRawValue());
        }
      }
    );
  }

  private deleteConfigMapData() {
    const copy = JSON.parse(JSON.stringify(this.configMaps));
    delete copy[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.configMapSrv.saveConfigMap(copy[this.activeConfigMapIndex]).subscribe(data => {
      if (data) {
        delete this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
        this.displaySnackBar(`Successfully deleted ${this.activeConfigDataKey} configmap data.`);
      }
    }, error => {
      this.displaySnackBar(`Failed to delete config map data REASON: ${error["statusText"]}`);
    });
  }

  private deleteConfigMap(){
    const name = this.configMaps[this.activeConfigMapIndex]['metadata']['name'];
    const namespace = this.configMaps[this.activeConfigMapIndex]['metadata']['namespace'];
    this.configMapSrv.deleteConfigMap(namespace, name).subscribe(data => {
      this.configMaps.splice(this.activeConfigMapIndex, 1);
      this.isConfigMapVisible.splice(this.activeConfigMapIndex, 1);
      this.ngOnInit();
      this.displaySnackBar(`Successfully deleted ${name}`);
    }, error => {
      this.displaySnackBar(`Failed to delete config map REASON: ${error["statusText"]}`);
    });
  }

  /**
   * Triggered when the primary button is clicked on the main delete modal
   */
  confirmDeleteSubmission(){
    //TODO issue a delete command

    if (this.isDeleteConfigMapData) {
      this.deleteConfigMapData();
    }

    if (this.isDeleteConfigMap){
      this.deleteConfigMap();
    }
    this.isDeleteConfigMap = false;
    this.isDeleteConfigMapData = false;
  }

  toggleDataDropDown(configMap: Object) {
    const index = this._getConfigIndex(configMap);
    this.isConfigMapVisible[index] = !this.isConfigMapVisible[index];
  }

  closeEditor(event: any) {
    this.isUserEditing = false;
  }

  private _getConfigIndex(config: Object){
    for( let index = 0; index < this.configMaps.length; index++){
      if (config["metadata"]["uid"] === this.configMaps[index]["metadata"]["uid"]){
        return index;
      }
    }
    return -1;
  }

  checkConfigMapVisibility(config: Object): boolean {
    const index = this._getConfigIndex(config);
    return this.isConfigMapVisible[index];
  }

  saveAndCloseEditor(dataToSave: {configData: string, associatedPods: Array<{podName:string, namespace: string}>}){

    const previous_config_map = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.isUserEditing = false;
    this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = dataToSave.configData;
    this.configMapSrv.saveConfigMap(this.configMaps[this.activeConfigMapIndex], dataToSave.associatedPods).subscribe(data => {
      if (data){
        this.displaySnackBar(`Successfully saved ${data['name']} config map, ${this.activeConfigDataKey}.
                              Check notification manager for pod bounce status.`);
      }
    }, error => {
      this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = previous_config_map;
      this.displaySnackBar(`Failed to save configmap ${this.activeConfigDataKey}.
                            REASON: ${error["statusText"]}`);
    });
  }
}
