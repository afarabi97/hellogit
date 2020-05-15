import { Component, Input } from '@angular/core';
import { ToolsService } from '../tools.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WebsocketService } from '../../services/websocket.service';

@Component({
    selector: 'app-repository-settings',
    templateUrl: './repository-settings.component.html',
    styleUrls: ['./repository-settings.component.scss'],
    host: {
        'class': 'app-repository-settings'
    }
})
export class RepositorySettingsComponent {
    isCardVisible: boolean;
    repositorySettings: FormGroup;
    ioConnection: any;
    allowUpdate: boolean;

    @Input()
    hasTitle: boolean;
  
    constructor(private toolsSrv: ToolsService,
                private _WebsocketService: WebsocketService) {
        this.hasTitle = true;

        let form = this.createFormControls();
        this.repositorySettings = form;

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
        this.allowUpdate = false;
        this.toolsSrv.configureRepository(this.repositorySettings.value).subscribe(
        data => {
            this.toolsSrv.displaySnackBar("Updating repository settings.");
        },
        error => {
            this.allowUpdate = true;
            this.toolsSrv.displaySnackBar(error);
        });
    }
}
