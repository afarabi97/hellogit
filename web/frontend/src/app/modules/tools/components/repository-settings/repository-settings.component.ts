import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MatSnackbarConfigurationClass } from '../../../../classes';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { ToolsService } from '../../../../system-setupv2/services/tools.service';
import { COMMON_VALIDATORS } from 'src/app/constants/cvah.constants'; '../../../../constants/cvah.constants';
import { UserService } from '../../../../services/user.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';

@Component({
    selector: 'app-repository-settings',
    templateUrl: './repository-settings.component.html',
    host: {
        'class': 'app-repository-settings'
    }
})
export class RepositorySettingsComponent {
    @Input() hasTitle: boolean;
    repoForm: FormGroup;
    ioConnection: any;
    allowUpdate: boolean;
    showForm: boolean = false;
    isCardVisible: boolean;
    controllerMaintainer: boolean;

    constructor(private toolsSrv: ToolsService,
                private userService: UserService,
                private formBuilder: FormBuilder,
                private matSnackBarService_: MatSnackBarService,
                private _WebsocketService: WebsocketService) {
        this.hasTitle = true;
        this.controllerMaintainer = this.userService.isControllerMaintainer();
        this.ioConnection = this._WebsocketService.onBroadcast()
        .subscribe((message: any) => {
            if(message['status'] === 'COMPLETED' || message['status'] === 'ERROR') {
                this.allowUpdate = true;
            }
        });

        this.allowUpdate = true;
    }

    ngOnInit() {
      this.initializeForm();
    }

    toggleCard(){
        this.isCardVisible = !this.isCardVisible;
      }

    update() {
        const matSnackbarConfiguration: MatSnackbarConfigurationClass = { timeInMS: 60000, actionLabel: 'Close' };
        this.allowUpdate = false;

        this.toolsSrv.configureRepository(this.repoForm.value).subscribe(
        data => {
            this.matSnackBarService_.displaySnackBar('Updating repository settings.', matSnackbarConfiguration);
        },
        error => {
          this.allowUpdate = true;
        });
    }

    initializeForm() {
        this.repoForm = this.formBuilder.group({
          endpoint: new FormControl(null, Validators.compose([validateFromArray(COMMON_VALIDATORS.isValidIP)])),
          protocol: new FormControl(null, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
          bucket: new FormControl(null, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
          access_key: new FormControl(null, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
          secret_key: new FormControl(null, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]))
        });
    }

    public getErrorMessage(control: AbstractControl): string {
      return control.errors ? control.errors.error_message : '';
    }
}
