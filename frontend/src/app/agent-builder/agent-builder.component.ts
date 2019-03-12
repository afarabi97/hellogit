import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AgentBuilderService } from '../agent-builder.service';
import * as FileSaver from 'file-saver';
import { AgentBuilderForm } from './agent-builder-form';
import { KitService } from '../kit.service';
import { HtmlModalPopUp } from '../html-elements';

@Component({
  selector: 'app-agent-builder',
  templateUrl: './agent-builder.component.html',
  styleUrls: ['./agent-builder.component.css']
})
export class AgentBuilderComponent implements OnInit {  
  agentBuilderForm: AgentBuilderForm;
  messageModal: HtmlModalPopUp;
  isGrrInstalledInKit: boolean;

  constructor(private agentBuilderSrv: AgentBuilderService,
              private  kitSrv: KitService) { 
    this.agentBuilderForm = new AgentBuilderForm();
    this.messageModal = new HtmlModalPopUp('kit_modal');
    this.isGrrInstalledInKit = false;
  }

  ngOnInit() {
    this.kitSrv.getKitForm().subscribe(data => {
      console.log(data['install_grr']);
      if (data === undefined || data === null){
        this.messageModal.updateModal("ERROR", "Building the single executable for the Winlogbeat, Google Rapid Response, \
          etc cannot be done until after you have setup a DIP Kit. Please finished the installation of your DIP by first \
          going to Kicstart and Kit pages.", "Close");
        this.messageModal.openModal();
      } else {
        if(data['install_grr'] !== null){
          this.isGrrInstalledInKit = data['install_grr'];
        } else {
          this.isGrrInstalledInKit = false;
        }
      }
    });
  }

  onSubmit(){
    let payload = this.agentBuilderForm.getRawValue();
    payload['isGrrInstalled'] = this.isGrrInstalledInKit;
    console.log("Payload: ", payload);
    this.agentBuilderSrv.getAgentInstaller(payload)
      .subscribe(
        installer_response => {
          const installer_blob = 
            new Blob([installer_response], { type: 'application/vnd.microsoft.portable-executable'});
          FileSaver.saveAs(installer_blob, 'monitor_install.exe');
        });
  }

}
