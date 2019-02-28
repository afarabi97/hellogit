import { Component, OnInit, ViewChild } from '@angular/core';
import { HtmlModalPopUp, HtmlDropDown, HtmlCardSelector,
         HtmlModalIPSelectDialog, HtmlModalRestoreArchiveDialog, ModalType } from '../html-elements';
import { KickstartInventoryForm, NodeFormGroup, CommentForm } from './kickstart-form';
import { KickstartService } from '../kickstart.service';
import { ArchiveService } from '../archive.service';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { CardSelectorComponent } from '../card-selector/card-selector.component';
import { Router } from '@angular/router';
import { KICKSTART_ID } from '../frontend-constants';

const NODE_PATTERN = new RegExp('^(server|sensor)[0-9]+[.]lan$');

@Component({
  selector: 'app-kickstart-form',
  templateUrl: './kickstart-form.component.html',
  styleUrls: ['./kickstart-form.component.css']
})
export class KickstartFormComponent implements OnInit {
  kickStartModal: HtmlModalPopUp;
  messageModal: HtmlModalPopUp;
  kickStartForm: KickstartInventoryForm;
  restoreModal: HtmlModalRestoreArchiveDialog;
  ipSelectorModal: HtmlModalIPSelectDialog;  
  deviceFacts: Object;

  @ViewChild('cardSelector')
  monitorInterfaceSelector: CardSelectorComponent;

  //Magically Injected by Angular
  constructor(private kickStartSrv: KickstartService,
              private archiveSrv: ArchiveService,
              private title: Title,
              private router: Router)
  {
    this.kickStartForm = new KickstartInventoryForm();    
    this.kickStartModal = new HtmlModalPopUp('kickstart_modal');
    this.messageModal = new HtmlModalPopUp('message_modal');
    this.restoreModal = new HtmlModalRestoreArchiveDialog('restore_modal');
    this.ipSelectorModal = new HtmlModalIPSelectDialog('ip_modal');
  }

  private _fill_up_array(formArrayLength: number){
    for (let i = 0; i < formArrayLength; i++){
      this.kickStartForm.addNodeGroup();
    }
  }

  /**
   * Maps our saved form object to view.
   *
   * @param data - The data to map
   * @param formGroup - The form group we are mapping our data too.
   */
  private _map_to_form(data: Object, formGroup: FormGroup){    
    for (let key in data){
      let someFormObject = formGroup.get(key);
      if (someFormObject instanceof HtmlDropDown){
        setTimeout(()=> {
          someFormObject.setValue(data[key]);
        });
      } else if (someFormObject instanceof FormControl){
        someFormObject.setValue(data[key]);
        someFormObject.markAsDirty();
      } else if (someFormObject instanceof FormGroup){
        this._map_to_form(data[key], someFormObject);
      } else if (someFormObject instanceof HtmlCardSelector){
        this.monitorInterfaceSelector.setDefaultValues(data[key]);
      } else if (someFormObject instanceof FormArray && data[key] instanceof Array){
        this._fill_up_array(data[key].length);

        for (let index = 0; index < data[key].length; index++){
          let someFormArrayObj = someFormObject.at(index);
          if (someFormArrayObj instanceof FormControl){
            someFormArrayObj.setValue(data[key][index]);
          } else if (someFormArrayObj instanceof FormGroup){
            this._map_to_form(data[key][index], someFormArrayObj);
          }
        }
      }
    }
  }

  /**
   * Executes after the constructor and after the view is rendered.
   */
  ngOnInit(): void {
    this.title.setTitle("Kickstart Configuration");
  }

  ngAfterViewInit(){
    this.initializeView();
  }

  private setupForm(data: Object, isCompleted: boolean=true){
    if (data === null || data === undefined){      
      return;
    }

    if (this.monitorInterfaceSelector == undefined){      
      return;
    }

    this._map_to_form(data, this.kickStartForm);    
    this.kickStartForm.re_password.updateValueAndValidity();

    if (isCompleted){
      this.kickStartForm.disable();
    } else{
      this.kickStartForm.enable();
    }
  }

  private initalizeForm(): void {
    this.kickStartSrv.getKickstartForm().subscribe(data => {
      this.setupForm(data);
    });
  }

  private initializeView(): void {
    //This is asynchronous so the browser will not block until this returns.
    this.kickStartSrv.gatherDeviceFacts("localhost")
      .subscribe(data => {
        this.deviceFacts = data;
        this.kickStartForm.setInterfaceSelections(this.deviceFacts);
        this.initalizeForm();
      });
  }  

  clearForm(): void {
    this.kickStartForm.reset();
    this.monitorInterfaceSelector.setDefaultValues([]);
    this.kickStartForm.enable();
  }

  enableForm(): void {
    this.kickStartForm.enable();
  }

  onSubmit(): void {
    this.kickStartSrv.generateKickstartInventory(this.kickStartForm.getRawValue())
      .subscribe(data => {
        if (data !== null && data['error_message']){
          this.messageModal.updateModal('Error',
            data['error_message'],
            undefined,
            'Close');
          this.messageModal.openModal();
        } else{
          this.openConsole();
        }        
    });
  }

  openConsole(){
    this.router.navigate(['/stdout/Kickstart'])
  }

  addNodes() {
    let nodeNumber: number = +this.kickStartForm.get('number_of_nodes')['value'];
    this.kickStartForm.clearNodes();
    for (let _i = 0; _i < nodeNumber; _i++){
      this.kickStartForm.addNodeGroup();
    }
  }

  removeNode(index: number){
    this.kickStartForm.nodes.removeAt(index);
  }

  addNode(){    
    this.kickStartForm.addNodeGroup();
    this.nodeTypeChange();
  }

  toggleNode(node: NodeFormGroup) {
    node.hidden = !node.hidden;
  }  

  get nodes() {
    return this.kickStartForm.get('nodes') as FormArray;
  }

  openArchiveConfirmation() {
    this.kickStartModal.updateModal('WARNING',
      'Are you sure you want to archive this form? Doing so will erase any fields \
      you have entered on the existing page but it will archive the form.',
      "Yes",
      'Cancel',
      ModalType.form,
      new CommentForm()
    )
    this.kickStartModal.openModal();
  }

  openRestoreModal(){
    this.archiveSrv.getArchivedForms(KICKSTART_ID).subscribe(data => {
      this.restoreModal.updateModal('Restore Form',
        'Please select an archived Kickstart form.  Keep in mind restoring a form will remove your current configuration.',
        "Restore",
        'Cancel'
      );
      this.restoreModal.updateModalSelection(data as Array<Object>);
      this.restoreModal.openModal();
    });
  }

  archiveForm(archiveForm: Object){
    this.archiveSrv.archiveForm(
      archiveForm, 
      this.kickStartForm.getRawValue(),
      KICKSTART_ID
    ).subscribe(data => {});
  }

  restoreForm(formId: string){
    this.archiveSrv.restoreArchivedForm(KICKSTART_ID, formId).subscribe(data => {
      this.kickStartForm.reset();
      this.setupForm(data['form'], data['is_completed_form']);
    });
  }

  private _resetNodes(srvOrSensors: Array<NodeFormGroup>, isServer: boolean) {
    for (let i = 0; i < srvOrSensors.length; i++) {
      let node: NodeFormGroup = srvOrSensors[i];
      let isMatch = NODE_PATTERN.test(node.hostname.value);

      if (node.hostname.value == "" || isMatch == true) {
        if (isServer) {
          let newHostName: string = "server" + (i + 1) + '.lan';
          if(!node.hostname.dirty){
            node.hostname.setValue(newHostName);
          }
        } else {
          let newHostName: string = "sensor" + (i + 1) + '.lan';
          if(!node.hostname.dirty){
            node.hostname.setValue(newHostName);
          }
        }
      }
    }
  }

  /**
   * Triggered when a user selects a new nodeType for a given node.
   *
   * @param value - The new value of the dropdown.
   * @param index - The current index the node is in the list.
   */
  nodeTypeChange(): void {
    let sensorArray:Array<NodeFormGroup> = [];
    let serverArray:Array<NodeFormGroup> = [];

    for (let i = 0; i < this.kickStartForm.nodes.length; i++) {
      let node = this.kickStartForm.nodes.at(i) as NodeFormGroup;

      if (node.node_type.value == "Server"){
        serverArray.push(node);
      } else if  (node.node_type.value == "Sensor" || node.node_type.value == "Remote Sensor"){
        sensorArray.push(node);
      }
    }

    this._resetNodes(sensorArray, false);
    this._resetNodes(serverArray, true);
  }

  openIPSelector(node_index: number){
    let mng_ip: Array<string> = this.kickStartForm.controller_interface.value;
    let netmask: string = this.kickStartForm.netmask.value
    
    if (mng_ip.length === 0){
      this.messageModal.updateModal("ERROR", "Failed to open IP selector because you \
      do not have a controller interface selected.", "Close");
      this.messageModal.openModal();
      return;
    }

    if (!this.kickStartForm.netmask.valid){
      this.messageModal.updateModal("ERROR", "Failed to open IP selector because the \
      netmask you entered is invalid.", "Close");
      this.messageModal.openModal();
      return;
    }

    this.kickStartSrv.getUnusedIPAddresses(mng_ip[0], netmask).subscribe(data => {
      this.ipSelectorModal.updateModal('Select unused IP',
        'Please select an unused IP address.',
        "Select",
        'Cancel',
        undefined,
        undefined,
        node_index
      );
      this.ipSelectorModal.updateModalSelection(data as Array<string>);
      this.ipSelectorModal.openModal();
    });
  }

  ipAddressSelected(ip_address: string){
    const node_index = this.ipSelectorModal.cacheData;
    let node = this.kickStartForm.nodes.at(node_index) as NodeFormGroup;
    node.ip_address.setValue(ip_address);
  }

}
