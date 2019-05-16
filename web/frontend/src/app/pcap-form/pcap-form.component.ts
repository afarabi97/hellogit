import { Component, OnInit, ViewChild } from '@angular/core';
import { PcapService } from '../pcap.service';
import { Title } from '@angular/platform-browser';
import { HtmlModalPopUp } from '../html-elements';
import { ModalLoadingComponent } from '../modal-loading/modal-loading.component';

@Component({
  selector: 'app-pcap-form',
  templateUrl: './pcap-form.component.html',
  styleUrls: ['./pcap-form.component.css']
})
export class PcapFormComponent implements OnInit {
  pcaps: Array<Object>;
  hostname: string;
  pcapToUpload: File = null;
  messageModal: HtmlModalPopUp;
  confirmModal: HtmlModalPopUp;
  pcapToDelete: string;

  showMd5: boolean;
  showSha1: boolean;
  showSha256: boolean;

  @ViewChild('loadingDialog')
  private loadingDialog: ModalLoadingComponent;

  constructor(private pcapSrv: PcapService,
              private title: Title) 
  {
    this.hostname = window.location.hostname;
    this.messageModal = new HtmlModalPopUp('message_modal');
    this.confirmModal = new HtmlModalPopUp('confirm_modal');
    this.pcapToDelete = "";
    this.showMd5 = true;
    this.showSha1 = false;
    this.showSha256 = false;
  }

  private initalizePage(){
    this.pcapSrv.getPcaps().subscribe(data => {
      this.pcaps = data as Array<Object>;
    });
  }

  ngOnInit() {
    this.title.setTitle("PCAP Test Files");
    this.initalizePage();
  }

  handleFileInput(files: FileList) {
    this.pcapToUpload = files.item(0);
  }

  private openMessageModal(data: any){
    if (data['success_message']){
      this.messageModal.updateModal("INFO", data['success_message'], "Close");
      this.initalizePage();
    } else if (data['error_message']){
      this.messageModal.updateModal("ERROR", data['error_message'], "Close");
    } else {
      this.messageModal.updateModal("ERROR", "Failed for unknown reason.", "Close");
    }

    this.messageModal.openModal();
  }

  uploadFile(){
    this.loadingDialog.openModal()
    this.pcapSrv.uploadPcap(this.pcapToUpload).subscribe(data => {
      //This timeout is put in place to ensure that the modal will hide.
      //For very small PCAPs its possible to upload them faster than the 
      //Loading dialog has time to open thus causing the modal to stay open forever.
      setTimeout(() => {
        this.loadingDialog.hideModal();
        this.openMessageModal(data);
      }, 1000);
    });
  }
  
  openConfirmModal(pcap: Object){
    this.pcapToDelete = pcap['name'];
    this.confirmModal.updateModal('WARNING',
            'Are you sure you want to permanently delete ' + pcap['name']  + '?',
            'Yes',
            'Cancel');
    this.confirmModal.openModal();
  }

  getHash(hashes: Object): string {
    if(this.showMd5){
      return hashes["md5"];
    }

    if(this.showSha1){
      return hashes["sha1"];
    }      
    
    if(this.showSha256){
      return hashes["sha256"];
    }      

    return hashes["md5"];
  }

  showMD5(){
    this.showMd5 = true;
    this.showSha1 = false;
    this.showSha256 = false;
  }

  showSHA1(){
    this.showSha1 = true;
    this.showMd5 = false;    
    this.showSha256 = false;
  }

  showSHA256(){
    this.showSha256 = true;
    this.showSha1 = false;
    this.showMd5 = false;
  }

  deleteFile(){
    this.pcapSrv.deletePcap(this.pcapToDelete).subscribe(data => {
      this.openMessageModal(data);
    });
  }
}
