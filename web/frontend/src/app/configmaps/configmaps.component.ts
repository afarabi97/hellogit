import { Component, OnInit } from '@angular/core';
import { ConfigmapsService } from './configmaps.service';
import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogFormControl } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ConfirmActionPopup } from '../classes/ConfirmActionPopup';

const DIALOG_WIDTH = '800px';
@Component({
  selector: 'app-configmaps',
  templateUrl: './configmaps.component.html',
  styleUrls: ['./configmaps.component.css']
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

  constructor(private configMapSrv: ConfigmapsService, private title: Title,
              private dialog: MatDialog,
              private snackBar: MatSnackBar,
              private formBuilder: FormBuilder,
              private confirmer: ConfirmActionPopup) {
    this.isUserEditing = false;
    this.isConfigMapVisible = new Array();
    this.configMaps = new Array();
    this.activeConfigDataTitle = "";
    this.activeConfigData = "";
    this.activeConfigMapName = "";
    this.activeConfigMapIndex = -1;
    this.isDeleteConfigMap = false;
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
    let ret_val = [];
    for (let item of Object.keys(obj)){
        ret_val.push(item);
    }
    return ret_val;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  addConfigMap() {
    let acdForm = this.formBuilder.group({
      namespace: new DialogFormControl("Namespace", "", [Validators.minLength(3), Validators.required]),
      name: new DialogFormControl("Name", "",
      [Validators.minLength(3),
       Validators.required,
       Validators.pattern('^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$')])
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
        let form = result as FormGroup;
        if(form && form.valid) {
          this.addNewConfigMap(form.getRawValue());
        }
      }
    );
  }

  removeConfigMap(configName: string, config: Object) {
    let configIndex = this._getConfigIndex(config);
    this.isDeleteConfigMap = true;
    this.activeConfigMapIndex = configIndex;
    this.confirmer.confirmAction(
      "Delete " + configName,
      "Are you sure you want to delete " + configName + "?\nAll data entries will be removed and this could cause your "
      + "system to break if you don't know what you are doing.",
      "Delete",
      configName + " successfully deleted",
      "Could not delete " + configName,
      () => { this.confirmDeleteSubmission() }
    );

  }

  editConfigMapData(configDataName: string, config: Object){
    let configMapIndex = this._getConfigIndex(config)
    this.activeConfigDataTitle = "Editing " + configDataName;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    let metadata = this.configMaps[this.activeConfigMapIndex]['metadata'];
    this.activeConfigMapName = metadata['name'];

    this.configMapSrv.getConfigMap(metadata['namespace'], metadata['name'], this.activeConfigDataKey).subscribe(data => {
      this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = data;
      this.activeConfigData = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    });

    this.isUserEditing = true;
  }

  addNewConfigMapData(formSubmission: Object){
    this.activeConfigDataTitle = "Editing " + formSubmission['name'];
    this.activeConfigDataKey = formSubmission['name'];
    if (!this.configMaps[this.activeConfigMapIndex]['data']){
      this.configMaps[this.activeConfigMapIndex]['data'] = {}
    }

    this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = '';
    this.activeConfigData = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.isUserEditing = true;
  }

  addNewConfigMap(formSubmission: Object){
    let newConfigMap = {'metadata': {'name': formSubmission['name'],
                                  'creation_timestamp': '',
                                  'namespace': formSubmission['namespace']},
                     'data': {}};
    this.configMapSrv.createConfigMap(newConfigMap).subscribe(data => {
      this.configMaps.splice(0, 0, data);
      this.isConfigMapVisible.splice(0, 0, true);
      this.displaySnackBar("Successfully added " + formSubmission['name']);
      this.ngOnInit();
    }, error => {
      this.displaySnackBar("Failed to save configmap. REASON: " + error["statusText"]);
    });
  }

  removeConfigMapData(configDataName: string, config: Object){
    let configMapIndex = this._getConfigIndex(config);
    this.isDeleteConfigMapData = true;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    this.confirmer.confirmAction("Delete " + configDataName,
                       "Are you sure you want to remove this data entry from the config map?",
                       "Delete",
                       configDataName + " successfully deleted.",
                       "Could not delete " + configDataName,
                       () => { this.confirmDeleteSubmission() });
  }

  addConfigMapData(config: Object){
    let configMapIndex = this._getConfigIndex(config);
    this.activeConfigMapIndex = configMapIndex;
    let acdForm = this.formBuilder.group({
      name: new DialogFormControl("Name", "",
        [Validators.minLength(3), Validators.required, Validators.pattern('^[A-z_0-9]+$')])
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
        let form = result as FormGroup;
        if(form && form.valid) {
          this.addNewConfigMapData(form.getRawValue());
        }
      }
    );
  }

  private deleteConfigMapData() {
    delete this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.configMapSrv.saveConfigMap(this.configMaps[this.activeConfigMapIndex]).subscribe(data => {
      if (data) {
        this.displaySnackBar("Successfully deleted " + this.activeConfigDataKey + " configmap data.");
      }
    }, error => {
      this.displaySnackBar("Failed to delete config map data REASON: " + error["statusText"]);
    });
  }

  private deleteConfigMap(){
    let name = this.configMaps[this.activeConfigMapIndex]['metadata']['name'];
    let namespace = this.configMaps[this.activeConfigMapIndex]['metadata']['namespace'];
    this.configMapSrv.deleteConfigMap(namespace, name).subscribe(data => {
      this.configMaps.splice(this.activeConfigMapIndex, 1);
      this.isConfigMapVisible.splice(this.activeConfigMapIndex, 1);
      this.ngOnInit();
      this.displaySnackBar("Successfully deleted " + name);
    }, error => {
      this.displaySnackBar("Failed to delete config map REASON: " + error["statusText"]);
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
    let index = this._getConfigIndex(configMap);
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
    let index = this._getConfigIndex(config);
    return this.isConfigMapVisible[index];
  }

  saveAndCloseEditor(dataToSave: {configData: string, associatedPods: Array<{podName:string, namespace: string}>}){

    let previous_config_map = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.isUserEditing = false;
    this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = dataToSave.configData;
    this.configMapSrv.saveConfigMap(this.configMaps[this.activeConfigMapIndex], dataToSave.associatedPods).subscribe(data => {
      if (data){
        this.displaySnackBar("Successfully saved " + data['name'] + " config map, " + this.activeConfigDataKey +
                             ". Check notification manager for pod bounce status.");
      }
    }, error => {
      this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = previous_config_map;
      this.displaySnackBar("Failed to save configmap " + this.activeConfigDataKey
                              + ". REASON: " + error["statusText"]);
    });
  }
}
