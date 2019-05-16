import { Component, OnInit } from '@angular/core';
import { IpTargetListForm } from './ip-target-list-form';
import { AgentBuilderService } from 'src/app/agent-builder.service';

@Component({
  selector: 'app-ip-target-list-dialog',
  templateUrl: './ip-target-list-dialog.component.html',
  styleUrls: ['./ip-target-list-dialog.component.css']
})
export class IpTargetListDialogComponent implements OnInit {

  dialogForm: IpTargetListForm = new IpTargetListForm();

  constructor() { }

  ngOnInit() {
  }

    openModal(agentBuilderSvc: AgentBuilderService) {
      this.dialogForm.agentBuilderSrv = agentBuilderSvc;
      this.dialogForm.populateSavedTargetSelector();
      $("#agent_deployer_modal").modal({backdrop: 'static', keyboard: false});
    }
  
    hideModal() {
      $("#agent_depolyer_modal").modal('hide');
    }

    onSubmit(){

    }

}
