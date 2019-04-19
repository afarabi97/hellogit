import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { KitInventoryForm, ServersFormArray, ServerFormGroup,
         SensorFormGroup, SensorsFormArray, toggleSensorAppSelections, 
         ExecuteKitForm } from './kit-form';
import { KickstartService } from '../kickstart.service';
import { KitService } from '../kit.service';
import { ArchiveService } from '../archive.service';
import { HtmlModalPopUp, HtmlDropDown, HtmlModalRestoreArchiveDialog, ModalType } from '../html-elements';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HomeNetFormGroup, ExternalNetFormGroup } from '../total-sensor-resources-card/total-sensor-resources-form';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { KIT_ID, SENSOR_APPS } from '../frontend-constants';
import { CommentForm } from '../kickstart-form/kickstart-form';
import { GENERAL_KIT_FAILURE_MSG } from '../frontend-constants';


@Component({
  selector: 'app-kit-form',
  templateUrl: './kit-form.component.html',
  styleUrls: ['./kit-form.component.css']
})
export class KitFormComponent implements OnInit, AfterViewInit{
  kitForm: KitInventoryForm;
  executeKitForm: ExecuteKitForm;
  hasKitForm: boolean;
  isExecuteKit: boolean;

  servers: ServersFormArray;
  sensors: SensorsFormArray;
  kitModal: HtmlModalPopUp;
  executeKitModal: HtmlModalPopUp;
  archiveKitModal: HtmlModalPopUp;
  restoreModal: HtmlModalRestoreArchiveDialog;
  isAdvancedOptionsHidden: boolean;
  isPercentagesHidden: boolean;

  //This boolean tracks if we are executing add node instead of execute kit.
  isAddNodeInsteadOfNewKit: boolean;

  //The addNodeCache
  addNodeCache: Array<Object>;

  @ViewChild('dateModal')
  dateModal: ModalDialogComponent;

  constructor(private kickStartSrv: KickstartService,
              private title: Title,
              private router: Router,
              private kitSrv: KitService,
              private archiveSrv: ArchiveService,
              private cdRef : ChangeDetectorRef) {
    this.kitForm = new KitInventoryForm();
    this.executeKitForm = new ExecuteKitForm();
    this.servers = this.kitForm.servers;
    this.sensors = this.kitForm.sensors;
    this.isAdvancedOptionsHidden = true;
    this.isPercentagesHidden = true;
    this.kitModal = new HtmlModalPopUp('kit_modal');
    this.executeKitModal = new HtmlModalPopUp('execute_kit_modal');
    this.archiveKitModal = new HtmlModalPopUp('archive_modal');
    this.restoreModal = new HtmlModalRestoreArchiveDialog("restore_modal");

    this.isExecuteKit = true;
    this.hasKitForm = false;
    this.isAddNodeInsteadOfNewKit = false;
    this.addNodeCache = new Array();
  }

  /**
   * Maps our saved form object to view.
   *
   * @param data - The data to map
   * @param formGroup - The form group we are mapping our data too.
   */
  private _map_to_form(data: Object, formGroup: FormGroup) {
    for (let key in data){
      const someFormObject = formGroup.get(key);

      if (someFormObject instanceof HtmlDropDown){        
        someFormObject.setValue(data[key]);        
      } else if (someFormObject instanceof FormControl){
        someFormObject.setValue(data[key]);
      } else if (someFormObject instanceof FormGroup){
        this._map_to_form(data[key], someFormObject);
      } else if (someFormObject instanceof SensorsFormArray
                 || someFormObject instanceof ServersFormArray) {
        const nodeFormArray: FormArray = someFormObject as FormArray;

        for (let index = 0; index < data[key].length; index++) {
          let srvFormGroup: SensorFormGroup | ServerFormGroup = new SensorFormGroup(false, null, null);
          let host_key = "host_sensor";
          if (someFormObject instanceof ServersFormArray){
            srvFormGroup = new ServerFormGroup(false, null);
            host_key = "host_server";
          }
          nodeFormArray.push(srvFormGroup);
          srvFormGroup.from_object(data[key][index]);
          this._gatherFacts(srvFormGroup, srvFormGroup.deviceFacts, host_key);          
          if (someFormObject instanceof ServersFormArray)
            this.esDriveSelected(data[key][index]['es_drives'], srvFormGroup as ServerFormGroup);          
        }
      } else if (key === 'home_nets' && someFormObject instanceof FormArray){
        for (let index = 0; index < data[key].length; index++){
          const homeNetFormGroup = new HomeNetFormGroup();
          homeNetFormGroup.home_net.setValue(data[key][index]['home_net']);
          someFormObject.push(homeNetFormGroup);
        }
      } else if (key === 'external_nets' && someFormObject instanceof FormArray){
        for (let index = 0; index < data[key].length; index++){
          const externalNetFormGroup = new ExternalNetFormGroup();
          externalNetFormGroup.external_net.setValue(data[key][index]['external_net']);
          someFormObject.push(externalNetFormGroup);
        }
      }
    }
  }

  ngOnInit() {
    this.title.setTitle("Kit Configuration");
    this.kitForm.reset();
  }

  ngAfterViewInit() {
    this.initalizeForm();
  }

  clearForm() {
    this.kitForm.reset();
    this.kitForm.enable();
    this.hasKitForm = false;
    this.isAddNodeInsteadOfNewKit = false;
    this.prepopulateFromKickstart();
    this.setKubernetesCIDRRange();
  }

  enableForm(){
    this.kitForm.enable();
    this.setKubernetesCIDRRange(false);
  }

  private openKickstartErrorModal(): void {
    this.kitModal.updateModal('Error',
    "What are you doing? You cannot create a Kit until you have a Kickstart configuration. \
    Please click on the Kickstart Configuration first and finish that form first.",
    undefined,
    'Close');

    this.kitModal.openModal();
  }

  private prepopulateFromKickstart(){
    this.kickStartSrv.getKickstartForm().subscribe(data => {
      if (!data) {
        this.openKickstartErrorModal();
        return;
      }

      for (const node of data["nodes"]) {
        this.appendNode(node);
      }

      this.gatherAllFacts();
    });
  }

  openArchiveConfirmation() {
    this.archiveKitModal.updateModal('WARNING',
      'Are you sure you want to save this form?',
      "Yes",
      'Cancel',
      ModalType.form,
      new CommentForm()
    )
    this.archiveKitModal.openModal();
  }

  archiveForm(archiveForm: Object): void {
    this.archiveSrv.archiveForm(archiveForm, this.kitForm.getRawValue(), KIT_ID).subscribe(data => {});
    this.setKubernetesCIDRRange();
  }

  openRestoreModal(){
    this.archiveSrv.getArchivedForms(KIT_ID).subscribe(data => {
      this.restoreModal.updateModal('Restore Form',
        'Please select an archived Kit form.  Keep in mind restoring a form will remove your current configuration.',
        "Restore",
        'Cancel'
      );
      this.restoreModal.updateModalSelection(data as Array<Object>);
      this.restoreModal.openModal();
    });
  }

  restoreForm(formId: string){
    setTimeout(() => {
      this.isAdvancedOptionsHidden = false;
      this.kitForm.enable();
    });

    setTimeout(() => {
      this.archiveSrv.restoreArchivedForm(KIT_ID, formId).subscribe(kitData => {
        this.isPercentagesHidden = !kitData["form"]["enable_percentages"];
        this.kitForm.reset();
        this.kickStartSrv.getKickstartForm().subscribe(kickstartData => {
          this.setupForm(kitData['form'], kickstartData, kitData['is_completed_form']);
        });
      });
    });
  }

  private openDateModal(isExecute: boolean, instructions: string){
    this.isExecuteKit = isExecute;

    this.executeKitModal.updateModal('WARNING',
      instructions,
      'Execute',
      'Cancel',
      ModalType.form,
      this.executeKitForm
    );
    this.dateModal.setTime();
    this.executeKitModal.openModal();
  }

  onSubmit(){
    this.openDateModal(true, 'Are you sure you want to execute this Kit configuration? Doing so will create a new cluster \
      with the configuration you created.  All data will be wiped out if you are running this on an existing cluster! \
      Before you can submit your Kit configuration, please make sure you enter the current UTC date and time below.  \
      This will set the nodes in the cluster to the appropriate time before configuring the rest \
      of the Kit.');
  }

  openGenKitInventoryModal(){
    this.openDateModal(false, 'Are you sure you want to generate the Kit inventory?  \
      Doing so will create a new inventory file in /opt/tfplenum/playbooks/inventory.yml. \
      To finish the Kit installation, you will need to cd /opt/tfplenum/playbooks then run make.');
  }

  private generateKitInventory(){
    this.kitSrv.generateKit(this.kitForm.getRawValue(),
                            this.executeKitForm.getRawValue()
    ).subscribe(data => {
      this.kitModal.updateModal('SUCCESS',
        "Inventory file generated successfully. To finish the Kit installation, \
        you will need to cd /opt/tfplenum/playbooks then run make.",
        undefined,
        'Close');
      this.kitModal.openModal();
    }, 
    err => {
      this.kitModal.updateModal('ERROR', GENERAL_KIT_FAILURE_MSG, "Close");
      this.kitModal.openModal();
    });
  }

  executeAddNode(){
    const payload = {'kitForm': this.kitForm.getRawValue(), 'nodesToAdd': this.addNodeCache};
    this.kitSrv.executeAddNode(payload)
    .subscribe(data => {
      this.openConsole();
      this.addNodeCache = new Array();
    });
  }

  executeKit(){
    if (this.isExecuteKit){
      this.kitSrv.executeKit(this.kitForm.getRawValue(),
                             this.executeKitForm.getRawValue())
        .subscribe(data => {
          this.openConsole();
        },
        err => {
          this.kitModal.updateModal('ERROR', GENERAL_KIT_FAILURE_MSG, "Close");
          this.kitModal.openModal();
        });
    } else {
      this.generateKitInventory();
    }
  }

  openConsole(){
    this.router.navigate(['/stdout/Kit']);
  }

  private appendNode(node: Object, disableIsKubernetesMasterCheckbox: boolean=false){
    if (node === undefined || node === null){
      return;
    }

    if (node["node_type"] === "Server" || node["node_type"] === "Controller") {
      this.kitForm.addServerFormGroup(node["ip_address"], disableIsKubernetesMasterCheckbox);
    } else if (node["node_type"] === "Sensor") {
      this.kitForm.addSensorFormGroup(node["ip_address"], 'Local');
    } else if (node["node_type"] === "Remote Sensor") {
      this.kitForm.addSensorFormGroup(node["ip_address"], 'Remote');
    } else {
      console.error("Unknown Node type." + node);
    }
  }

  private setKubernetesCIDRRange(setValue: boolean=true){
    while (this.kitForm.kubernetes_services_cidr.options.length !== 0){
      this.kitForm.kubernetes_services_cidr.options.pop();
    }

    this.kickStartSrv.getAvailableIPBlocks().subscribe(ipblocks => {
      let avaiable_ip_addrs = ipblocks as Array<string>;
      if (avaiable_ip_addrs.length > 0){
        for (let ip of avaiable_ip_addrs) {
          this.kitForm.kubernetes_services_cidr.options.push(ip);
        }
        if (setValue)
          this.kitForm.kubernetes_services_cidr.default_value = this.kitForm.kubernetes_services_cidr.options[0];
      } else {
        if (setValue)
          this.kitForm.kubernetes_services_cidr.default_value = ''
      }
      if (setValue)
        this.kitForm.kubernetes_services_cidr.setValue(this.kitForm.kubernetes_services_cidr.default_value);
      this.kubernetesInputEvent(null);
    });
  }

  private setupForm(kitData: Object, kickstartData: Object, isCompleted: boolean=true){
    if (kitData === null || kitData === undefined) {
      this.prepopulateFromKickstart();
      this.hasKitForm = false;
      this.isAddNodeInsteadOfNewKit = false;
      this.setKubernetesCIDRRange();
      return;
    }
    
    this._map_to_form(kitData, this.kitForm);
    this.kubernetesInputEvent(null);
    this.cdRef.detectChanges();
    this.hasKitForm = true;

    if (isCompleted){
      this.kitForm.disable();
    } else {
      this.kitForm.enable();
    }

    outer:
    for(const node of kickstartData['nodes']){

      for (const kitServer of kitData['servers']){
        if (kitServer["host_server"] === node["ip_address"]){
          continue outer;
        }
      }

      for (const kitServer of kitData['sensors']){
        if (kitServer["host_sensor"] === node["ip_address"]){
          continue outer;
        }
      }

      this.addNodeCache.push(node);
      this.appendNode(node, true);

      //We know here that we are adding nodes because our kickstart configuration is
      //different from our kit configuration.
      this.isAddNodeInsteadOfNewKit = true;
    }
  }

  private initalizeForm(): void {

    this.kickStartSrv.getKickstartForm().subscribe(kickstartData => {
      if (!kickstartData) {
        this.openKickstartErrorModal();
        return;
      }

      this.kitSrv.getKitForm().subscribe(kitData => {
        this.setupForm(kitData, kickstartData)
      });
    });
  }

  toggleServer(server: ServerFormGroup) {
    server.hidden = !server.hidden;
  }

  toggleSensor(sensor: SensorFormGroup) {
    sensor.hidden = !sensor.hidden;
  }

  private _gatherFacts(node: ServerFormGroup | SensorFormGroup,
                       data: Object, host_key: string) {
    if (data['error_message']) {
      this.kitModal.updateModal('Error',
        data['error_message'],
        undefined,
        'Close');

      this.kitModal.openModal();
      //End execution of this if we have errors.
      return;
    }

    // Clear resources on every run of gather facts.
    if (node.deviceFacts){
      this.kitForm.system_resources.subtractFromDeviceFacts(node.deviceFacts);
      node.clearSelectors();
      if (node instanceof ServerFormGroup) {
        this.kitForm.server_resources.subtractFromDeviceFacts(node.deviceFacts);
        this.kitForm.server_resources.removeClusterStorage(node.deviceFacts);
      } else if (node instanceof SensorFormGroup) {
        this.kitForm.sensor_resources.subtractFromDeviceFacts(node.deviceFacts);
      }
    }

    //Set device facts after resource reset
    node.deviceFacts = data;
    //Ensures we do not add additional compute power and memory by accident.
    if (node instanceof ServerFormGroup) {
      node.setOptionSelections();
    } else if (node instanceof SensorFormGroup) {
      node.setSensorOptionsSelections(node[host_key].value);
    }

    node.basicNodeResource.setFromDeviceFacts(node.deviceFacts);
    this.kitForm.system_resources.setFromDeviceFacts(node.deviceFacts);
    node.hostname.setValue(node.deviceFacts["hostname"]);

    if (node instanceof ServerFormGroup) {
      this.kitForm.server_resources.setFromDeviceFacts(node.deviceFacts);
    } else if (node instanceof SensorFormGroup) {
      this.kitForm.sensor_resources.setFromDeviceFacts(node.deviceFacts);
    }
  }

  gatherFacts(node: ServerFormGroup | SensorFormGroup) {
    let host_key = "host_server";
    if (node instanceof SensorFormGroup) {
      host_key = "host_sensor";
    }
    this.kickStartSrv.gatherDeviceFacts(node.value[host_key])
    .subscribe(data => {
      this._gatherFacts(node, data, host_key);
    });
  }

  private gatherAllFacts(){
    for (let i = 0; i < this.kitForm.sensors.length; i++){
      let host_key = "host_sensor";
      let node = this.kitForm.sensors.at(i) as SensorFormGroup;
      this.kickStartSrv.gatherDeviceFacts(node.value[host_key]).subscribe(data => {
        this._gatherFacts(node, data, host_key);
      });
    }

    for (let i = 0; i < this.kitForm.servers.length; i++){
      let host_key = "host_server";
      let node = this.kitForm.servers.at(i) as ServerFormGroup;
      this.kickStartSrv.gatherDeviceFacts(node.value[host_key]).subscribe(data => {
        this._gatherFacts(node, data, host_key);
      });
    }
  }

  toggleAdvancedSettings(){
    this.isAdvancedOptionsHidden = !this.isAdvancedOptionsHidden;
  }

  esDriveSelected(drivesSelected: Array<string>, node: ServerFormGroup): void {   
    this.kitForm.server_resources.calculateClusterStorageAvailable(drivesSelected, node.deviceFacts);
    this.setSystemClusterStorageAvailable();
  }

  private setSystemClusterStorageAvailable(){
    this.kitForm.system_resources.clusterStorageAvailable = 0;
    this.kitForm.system_resources.clusterStorageAvailable += this.kitForm.server_resources.clusterStorageAvailable;
  }

  /**
   * Disables other "Is Kubernetes master server" checkboxes on the UI.
   *
   * @param isChecked - Is true if the checkbox has a check mark in it, false otherwise.
   * @param indexToIgnore - The server index to ignore
   */
  disableOtherMasterOrReenable(isChecked: boolean, indexToIgnore: number){
    for (let index = 0; index < this.kitForm.servers.length; index++){
      if (index === indexToIgnore){
        continue;
      }
      const server = this.kitForm.servers.at(index) as ServerFormGroup;
      if (isChecked){
        server.is_master_server.disable();
      } else{
        server.is_master_server.enable();
      }
    }
  }

  /**
   * Triggered everytime a user adds input to the Kubernetes CIDR input
   *
   * @param event - A Keyboard event.
   */
  kubernetesInputEvent(event: any) {
    const kubernetes_value = this.kitForm.kubernetes_services_cidr.value;
    if (kubernetes_value === undefined || kubernetes_value === null){
      return;
    }

    const octet_1 = kubernetes_value.split('.')[0] + '.';
    const octet_2 = kubernetes_value.split('.')[1] + '.';
    const octet_3 = kubernetes_value.split('.')[2] + '.';
    let octet_4 = parseInt(kubernetes_value.split('.')[3], 10);
    let kubernetes_services_cidr_start = "";

    if (isNaN(octet_4)) {
      this.kitForm.kubernetesCidrInfoText = "Incomplete IP Address";
    } else {
      while (octet_4 > 0) {
        // The magic number 16 correlates to a /28. We're basically looking for
        // the first subnet which matches a /28 and that will end up being the
        // base address for the range. If the number is evenly divisible by 16
        // that means we've found the base of the address range and 15 beyond that
        // is the maximum range.
        if (octet_4 % 16 === 0) {
          break;
        } else {
          octet_4 -= 1;
        }
      }
      // You can't have an address of 0 so Metallb will actually increment this by
      // 1 in this case.
      if (octet_4 === 0) {
        octet_4 = 1;
        kubernetes_services_cidr_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kitForm.kubernetesCidrInfoText = "Kubernetes services range will be: "
          + kubernetes_services_cidr_start + "-" + String(octet_4 + 14);
      } else {
        kubernetes_services_cidr_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kitForm.kubernetesCidrInfoText = "Kubernetes services range will be: "
          + kubernetes_services_cidr_start + "-" + String(octet_4 + 15);
      }
    }

  }

  togglePercentages(){
    this.isPercentagesHidden = !this.isPercentagesHidden;
    if(this.isPercentagesHidden){
      for (let index = 0; index <  this.kitForm.sensors.length; index++){
        let sensor = this.kitForm.sensors.at(index) as SensorFormGroup;
        sensor.bro_cpu_percentage.disable();
        sensor.suricata_cpu_percentage.disable();
        sensor.moloch_cpu_percentage.disable();
        sensor.moloch_mem_limit.disable();
      }
    } else {
      for (let index = 0; index <  this.kitForm.sensors.length; index++){
        let sensor = this.kitForm.sensors.at(index) as SensorFormGroup;
        let sensor_apps: Array<string> = sensor.sensor_apps.value;

        if (sensor_apps.includes(SENSOR_APPS[0])){        
          sensor.bro_cpu_percentage.enable();
        } else {
          sensor.bro_cpu_percentage.disable();
        }

        if (sensor_apps.includes(SENSOR_APPS[1])){        
          sensor.suricata_cpu_percentage.enable();
        } else {
          sensor.suricata_cpu_percentage.disable();
        }

        if (sensor_apps.includes(SENSOR_APPS[2])){        
          sensor.moloch_cpu_percentage.enable();
          sensor.moloch_mem_limit.enable();
        } else {          
          sensor.moloch_cpu_percentage.disable();
          sensor.moloch_mem_limit.disable();
        }  
      }
    }
  }

  sensorAppSelect(sensor: SensorFormGroup, selected: Array<string>){
    if (this.kitForm.enable_percentages.value === null) {
      toggleSensorAppSelections(sensor, selected, false);
    } else {
      toggleSensorAppSelections(sensor, selected, this.kitForm.enable_percentages.value);
    }
    this.cdRef.detectChanges();
  }
}
