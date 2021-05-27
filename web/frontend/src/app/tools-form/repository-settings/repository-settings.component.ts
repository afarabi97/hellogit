import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSnackbarConfigurationClass } from '../../classes';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { ToolsService } from '../../system-setupv2/services/tools.service';

import { UserService } from '../../services/user.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-repository-settings',
    templateUrl: './repository-settings.component.html',
    styleUrls: ['./repository-settings.component.scss'],
    host: {
        'class': 'app-repository-settings'
    }
})
export class RepositorySettingsComponent {
    repositorySettings: FormGroup;
    ioConnection: any;
    allowUpdate: boolean;
    showForm: boolean = false;
    isCardVisible: boolean;
    controllerMaintainer: boolean;

    @Input()
    hasTitle: boolean;

    constructor(private toolsSrv: ToolsService,
                private userService: UserService,
                private matSnackBarService_: MatSnackBarService,
                private _WebsocketService: WebsocketService) {
        let form = this.createFormControls();
        this.repositorySettings = form;
        this.hasTitle = true;
        this.controllerMaintainer = this.userService.isControllerMaintainer();

        this.ioConnection = this._WebsocketService.onBroadcast()
        .subscribe((message: any) => {
            if(message["status"] === "COMPLETED" || message["status"] === "ERROR") {
                this.allowUpdate = true;
            }
        });

        this.allowUpdate = true;
    }

    private createFormControls() {
        let endpoint = new FormControl(null, Validators.required);
        let protocol = new FormControl(null, Validators.required);
        let bucket = new FormControl(null, Validators.required);
        let access_key = new FormControl(null, Validators.required);
        let secret_key = new FormControl(null, Validators.required);
        let controls = {
            'endpoint': endpoint,
            'protocol': protocol,
            'bucket': bucket,
            'access_key': access_key,
            'secret_key': secret_key
        };
        let form = new FormGroup(controls);
        return form;
    }

    toggleCard(){
        this.isCardVisible = !this.isCardVisible;
      }

    update(event) {
        const matSnackbarConfiguration: MatSnackbarConfigurationClass = { timeInMS: 60000, actionLabel: 'Close' };
        this.allowUpdate = false;
        this.toolsSrv.configureRepository(this.repositorySettings.value).subscribe(
        data => {
            this.matSnackBarService_.displaySnackBar('Updating repository settings.', matSnackbarConfiguration);
        },
        error => {
            this.allowUpdate = true;
            this.matSnackBarService_.displaySnackBar(error, matSnackbarConfiguration);
        });
    }
}
