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
import { KICKSTART_ID, CTRL_SELECTED } from '../frontend-constants';
import { isIpv4InSubnet } from '../globals';

@Component({
  selector: 'app-kickstart-form',
  templateUrl: './kickstart-form.component.html',
  styleUrls: ['./kickstart-form.component.css']
})
export class KickstartFormComponent implements OnInit {
  kickStartModal: HtmlModalPopUp;
  messageModal: HtmlModalPopUp;
  continueModal: HtmlModalPopUp;
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
    this.continueModal = new HtmlModalPopUp('continue_modal');
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
   * Opens the IP Change Modal in the event we have a controller IP change detection.
   * 
   * @param oldIP - The current configuration IP address.
   */
  private openIPChangedModal(oldIP: string){
    //The kickstartfomr interface selections was refreshed before we 
    //Map an old form to an exisiting one.
    let openmodal = true;
    for (let newip of this.kickStartForm.interfaceSelections){
      if (oldIP === newip.value){
        openmodal = false;
        break;
      }
    }

    if (openmodal){
      let networkIP = this.deviceFacts['default_ipv4_settings']['network'];
      let netmask = this.deviceFacts['default_ipv4_settings']['netmask'];
      let newIP = this.deviceFacts['default_ipv4_settings']['address'];
      if (isIpv4InSubnet(oldIP, networkIP, netmask)){
        this.kickStartSrv.updateKickstartCtrlIP(newIP).subscribe(data => {
          if (data !== null && data['error_message']){
            this.messageModal.updateModal("INFO", "Failed to update IP Address on current Kickstart page.", "Close");
            this.messageModal.openModal();
          } else {
            this.messageModal.updateModal("INFO", "Controller IP change detected! \
              Since the old controller IP is in the same subnet as the new IP we automatically \
              changed the Kickstart data so no action is necessary.", "Close");
              this.messageModal.openModal();
          }
        });        
      } else {
        this.kickStartSrv.archiveConfigurationsAndClear().subscribe(() => {
          this.clearForm();
          this.messageModal.updateModal("INFO", "Controller IP change detected! \
          Since the old controller IP is not in the same subnet as the new IP we automatically \
          archived your old Kickstart and Kit configurations.  You will need to setup a new DIP \
          from scratch on this new IP range.", "Close");
            this.messageModal.openModal();
        });
      }
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
        this.openIPChangedModal(data[key][0]);
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
    this.refreshDHCPRange(this.kickStartForm.controller_interface.value, false);

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
    this.refreshDHCPRange(this.kickStartForm.controller_interface.value);
  }

  enableForm(): void {
    this.kickStartForm.enable();
  }

  onSubmit(): void {
    let payload = this.kickStartForm.getRawValue();
    payload['continue'] = false;
    this.kickStartSrv.generateKickstartInventory(payload)
      .subscribe(data => {
        if (data !== null && data['error_message']){
          this.continueModal.updateModal('Error',
            data['error_message'],
            'Continue Anyways',
            'Cancel');
          this.continueModal.openModal();
        } else{
          this.openConsole();
        }
    });
  }

  continueAnyways(){
    let payload = this.kickStartForm.getRawValue();
    payload['continue'] = true;
    this.kickStartSrv.generateKickstartInventory(payload)
      .subscribe(data => {
        this.openConsole();
    });
  }

  private setGatewayAndNetMask(selectedIP: string){
    if (selectedIP === this.deviceFacts['default_ipv4_settings']['address']){
      this.kickStartForm.gateway.setValue(this.deviceFacts['default_ipv4_settings']['gateway']);
      this.kickStartForm.netmask.setValue(this.deviceFacts['default_ipv4_settings']['netmask']);
    }
  }

  refreshDHCPRange(ctrlips: Array<string>, setValue: boolean=true) {
    if (ctrlips.length === 0){
      this.kickStartForm.dhcpRangeText = CTRL_SELECTED;
    } else {
      this.setDHCPRanges(ctrlips[0], setValue);
      this.setGatewayAndNetMask(ctrlips[0]);
    }
  }

  private setDHCPRanges(controller_ip: string, setValue: boolean=true){
    while (this.kickStartForm.dhcp_range.options.length !== 0){
      this.kickStartForm.dhcp_range.options.pop();
    }

    this.kickStartSrv.getAvailableIPBlocks2(controller_ip, this.kickStartForm.netmask.value).subscribe(ipblocks => {
      let avaiable_ip_addrs = ipblocks as Array<string>;
      if (avaiable_ip_addrs.length > 0){
        for (let ip of avaiable_ip_addrs) {
          this.kickStartForm.dhcp_range.options.push(ip);
        }
        if (setValue)
          this.kickStartForm.dhcp_range.default_value = this.kickStartForm.dhcp_range.options[0];
      } else {
        if (setValue)
          this.kickStartForm.dhcp_range.default_value = ''
      }
      if (setValue)
        this.kickStartForm.dhcp_range.setValue(this.kickStartForm.dhcp_range.default_value);
      this.dhcpInputEvent(null);
    });
  }

  dhcpInputEvent(event: any) {
    const kubernetes_value = this.kickStartForm.dhcp_range.value;
    if (kubernetes_value === undefined) {
      return;
    }

    const octet_1 = kubernetes_value.split('.')[0] + '.';
    const octet_2 = kubernetes_value.split('.')[1] + '.';
    const octet_3 = kubernetes_value.split('.')[2] + '.';
    let octet_4 = parseInt(kubernetes_value.split('.')[3], 10);
    let dhcp_range_start = "";

    if (isNaN(octet_4)) {
      this.kickStartForm.dhcpRangeText = CTRL_SELECTED;
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
        dhcp_range_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kickStartForm.dhcpRangeText = "DHCP range will be: "
          + dhcp_range_start + "-" + String(octet_4 + 14);
      } else {
        dhcp_range_start = octet_1 + octet_2 + octet_3 + String(octet_4);
        this.kickStartForm.dhcpRangeText = "DHCP range will be: "
          + dhcp_range_start + "-" + String(octet_4 + 15);
      }
    }

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
  }

  toggleNode(node: NodeFormGroup) {
    node.hidden = !node.hidden;
  }

  get nodes() {
    return this.kickStartForm.get('nodes') as FormArray;
  }

  openArchiveConfirmation() {
    this.kickStartModal.updateModal('WARNING',
      'Are you sure you want to save this form?',
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
    ).subscribe(() => { });
  }

  restoreForm(formId: string){
    this.archiveSrv.restoreArchivedForm(KICKSTART_ID, formId).subscribe(data => {
      this.kickStartForm.reset();
      this.setupForm(data['form'], data['is_completed_form']);
    });
  }

  findrightmacaddress(): string {
    return this.deviceFacts["interfaces"].filter( i => {
      return i["ip_address"] === this.kickStartForm.value.controller_interface[0];
    });
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
