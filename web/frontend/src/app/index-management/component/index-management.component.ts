import { Component, ViewChild } from '@angular/core';
import { IndexManagementService } from '../service/index-management.service';
import { NgForm, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';
import { MatStepper } from '@angular/material/stepper';

@Component({
    selector: 'app-index-management',
    templateUrl: './index-management.component.html',
    host: {
        'class': 'app-index-management'
    }
})
export class IndexManagementComponent {
    isCardVisible: boolean = true;
    indexManagementList: FormGroup;
    indexManagementActions: FormGroup;
    ioConnection: any;
    allowUpdate: boolean;
    closedIndices: string[];
    openedIndices: string[];
    indices: string[];
    isEditable = false;
    isLoading = false;
    isEmpty = false;
    actions: Array<any> = [{value: 'CloseIndices', name: 'Close', hoverText: "Select an index to Close"},
                           {value: 'DeleteIndices', name: 'Delete', hoverText: "Select an index to Delete"}];
    @ViewChild('imaFormDirective', {static: false}) private imaFormDirective: NgForm;
    @ViewChild('imlFormDirective', {static: false}) private imlFormDirective: NgForm;

    constructor(private _indexManagementSrv: IndexManagementService,
                private _WebsocketService: WebsocketService,
                private formBuilder: FormBuilder,) {

        this.indexManagementActions = this.formBuilder.group({
          action: new FormControl(null, Validators.required)
        });
        this.indexManagementList = this.formBuilder.group({
          index_list: new FormControl(null, Validators.required)
        });

        this.ioConnection = this._WebsocketService.onBroadcast()
        .subscribe((message: any) => {
            if(message["status"] === "COMPLETED" || message["status"] === "ERROR") {
                this.allowUpdate = true;
            }
        });

        this.allowUpdate = true;
    }

    getClosedIndices(stepper: MatStepper): void {
      this._indexManagementSrv.get_closed_indices().subscribe(closedIndices => {
        this.indices = closedIndices;
        this.isLoading = false;
        stepper.next();
      });
    }

    getOpenedIndices(stepper: MatStepper): void {
      this._indexManagementSrv.get_opened_indices().subscribe(openedIndices => {
        this.indices = openedIndices;
        this.isLoading = false;
        stepper.next();
      });
    }

    isEmptyFun() {
      this.isEmpty = this.indexManagementList.value.index_list.length !== 0
    }

    goBack(stepper: MatStepper) {
      this.resetForm(stepper);
    }

    goForwardAction(stepper: MatStepper) {
      switch (this.indexManagementActions.value.action) {
        case 'DeleteIndices':
          this.isLoading = true;
          this.getClosedIndices(stepper);
          break;
        case 'CloseIndices':
          this.isLoading = true;
          this.getOpenedIndices(stepper);
          break;
      }
    }

    goForwardList(stepper: MatStepper) {
      const object = {action: this.indexManagementActions.value.action, index_list: this.indexManagementList.value.index_list};
      this._indexManagementSrv.indexManagement(object).subscribe(
      data => {
          this._indexManagementSrv.displaySnackBar(data["message"]);
          this.allowUpdate = true;
      },
      error => {
          this.allowUpdate = true;
          this._indexManagementSrv.displaySnackBar(error);
      });

      this.resetForm(stepper);
    }

    resetForm(stepper: MatStepper) {
      stepper.reset();
      this.imlFormDirective.resetForm();
      this.imaFormDirective.resetForm();
    }

}
