import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ErrorMessageClass, GenericJobAndKeyClass } from '../../../../classes';
import { COMMON_VALIDATORS, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { RepoSettingsSnapshotInterface } from '../../interfaces/repo-settings-snapshot.interface';
import { ToolsService } from '../../services/tools.service';

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

    constructor(private tools_service_: ToolsService,
                private userService: UserService,
                private formBuilder: FormBuilder,
                private mat_snackbar_service_: MatSnackBarService,
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
        this.allowUpdate = false;
        const repo_settings_snapshot: RepoSettingsSnapshotInterface = this.repoForm.getRawValue() as RepoSettingsSnapshotInterface;

        this.tools_service_.repo_settings_snapshot(repo_settings_snapshot)
          .subscribe(
            (response: GenericJobAndKeyClass) => {
              this.mat_snackbar_service_.displaySnackBar('Updating repository settings.', MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            },
            (error: ErrorMessageClass | HttpErrorResponse) => {
              this.allowUpdate = true;
              if (error instanceof ErrorMessageClass) {
                this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              } else {
                const message: string = `updating repository settings snapshot`;
                this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              }
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
