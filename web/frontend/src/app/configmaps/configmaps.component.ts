import { Component, OnInit } from '@angular/core';
import { ConfigmapsService } from './configmaps.service';
import { HtmlModalPopUp, ModalType } from '../html-elements';
import { AddConfigDataForm, AddConfigMapForm } from './configmaps.form';
import { Title } from '@angular/platform-browser';

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

  activeConfigDataTitle: string;
  activeConfigDataKey: string;
  activeConfigData: string;
  activeConfigMapIndex: number;

  configMapsModal: HtmlModalPopUp;
  addConfigMapDataModal: HtmlModalPopUp;
  addConfigMapModal: HtmlModalPopUp;

  constructor(private configMapSrv: ConfigmapsService, private title: Title) {
    this.isUserEditing = false;
    this.isConfigMapVisible = new Array();
    this.configMaps = new Array();
    this.activeConfigDataTitle = "";
    this.activeConfigData = "";
    this.activeConfigMapIndex = -1;
    this.configMapsModal = new HtmlModalPopUp("configmaps_modal");
    this.addConfigMapDataModal = new HtmlModalPopUp("addconfigdata_modal");
    this.addConfigMapModal = new HtmlModalPopUp("addconfigmap_modal");
    this.isDeleteConfigMap = false;
   }

  ngOnInit() {
    this.title.setTitle("Config Maps");
    this.configMapSrv.getConfigMaps().subscribe(data => {
      if (data['items']){
        this.configMaps = data['items'];
        this.isConfigMapVisible = new Array(this.configMaps.length).fill(false);
      }
    });
  }

  objectKeys(obj: any) {
    let ret_val = [];
    for (let item of Object.keys(obj)){
        ret_val.push(item);
    }
    return ret_val;
  }

  addConfigMap() {
    this.addConfigMapModal.updateModal("Add Config Map", "Please fill out the form.", "Submit", "Cancel", ModalType.form, new AddConfigMapForm());
    this.addConfigMapModal.openModal();
  }

  removeConfigMap(configName: string, configIndex: number) {
    this.isDeleteConfigMap = true;
    this.activeConfigMapIndex = configIndex;
    this.configMapsModal.updateModal("Delete " + configName, "Are you sure you want to remove this config map? " +
                                     "All data entries will be removed and this could cause your system to break " +
                                     "if you dont know what you are doing.", "Delete", "Cancel", ModalType.error);
    this.configMapsModal.openModal();
  }

  editConfigMapData(configDataName: string, configMapIndex: number){
    this.activeConfigDataTitle = "Editing " + configDataName;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    this.activeConfigData = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
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
      this.configMapsModal.updateModal("Success ", "Successfully added " + formSubmission['name'], "Ok");
      this.configMapsModal.openModal();
    }, error => {
      console.log(error);
      this.configMapsModal.updateModal("Error ", "Failed to save configmap. REASON: " + error["statusText"], "Ok", undefined, ModalType.error);
      this.configMapsModal.openModal();
    });

  }

  removeConfigMapData(configDataName: string, configMapIndex: number){
    this.isDeleteConfigMapData = true;
    this.activeConfigDataKey = configDataName;
    this.activeConfigMapIndex = configMapIndex;
    this.configMapsModal.updateModal("Delete " + configDataName, "Are you sure you want to remove this data entry from the config map?", "Delete", "Cancel");
    this.configMapsModal.openModal();
  }

  addConfigMapData(configMapIndex: number){
    this.activeConfigMapIndex = configMapIndex;
    this.addConfigMapDataModal.updateModal("Add Config Map Data", "Please fill out the form.", "Submit", "Cancel", ModalType.form, new AddConfigDataForm());
    this.addConfigMapDataModal.openModal();
  }

  private deleteConfigMapData() {
    delete this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.configMapSrv.saveConfigMap(this.configMaps[this.activeConfigMapIndex]).subscribe(data => {
      if (data) {
        this.configMapsModal.updateModal("Success ", "Successfully deleted " + this.activeConfigDataKey + " configmap data!", "Ok");
        this.configMapsModal.openModal();
      }
    }, error => {
      console.log(error);
      this.configMapsModal.updateModal("Error ", "Failed to delete config map data REASON: " + error["statusText"], "Ok", undefined, ModalType.error);
      this.configMapsModal.openModal();
    });
  }

  private deleteConfigMap(){
    let name = this.configMaps[this.activeConfigMapIndex]['metadata']['name'];
    let namespace = this.configMaps[this.activeConfigMapIndex]['metadata']['namespace'];
    this.configMapSrv.deleteConfigMap(namespace, name).subscribe(data => {
      this.configMaps.splice(this.activeConfigMapIndex, 1);
      this.isConfigMapVisible.splice(this.activeConfigMapIndex, 1);
      this.configMapsModal.updateModal("Success ", "Successfully deleted " + name, "Ok");
      this.configMapsModal.openModal();
    }, error => {
      console.log(error);
      this.configMapsModal.updateModal("Error ", "Failed to delete config map REASON: " + error["statusText"], "Ok", undefined, ModalType.error);
      this.configMapsModal.openModal();
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

  toggleDataDropDown(index: number) {
    this.isConfigMapVisible[index] = !this.isConfigMapVisible[index];
  }

  closeEditor(event: any) {
    this.isUserEditing = false;
  }

  saveAndCloseEditor(dataToSave: string){
    let previous_config_map = this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey];
    this.isUserEditing = false;
    this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = dataToSave;
    this.configMapSrv.saveConfigMap(this.configMaps[this.activeConfigMapIndex]).subscribe(data => {
      if (data){
        this.configMapsModal.updateModal("Success ", "Successfully saved " + data['name'] + " configmap!", "Ok");
        this.configMapsModal.openModal();
      }
    }, error => {
      console.log(error);
      this.configMaps[this.activeConfigMapIndex]['data'][this.activeConfigDataKey] = previous_config_map;
      this.configMapsModal.updateModal("Error ", "Failed to save configmap " + this.activeConfigDataKey +
                                       ". REASON: " + error["statusText"], "Ok", undefined, ModalType.error);
      this.configMapsModal.openModal();
    });
  }
}
