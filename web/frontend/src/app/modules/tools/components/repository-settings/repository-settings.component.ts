import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, GenericJobAndKeyClass, NotificationClass, ObjectUtilitiesClass } from '../../../../classes';
import {
  COMMON_VALIDATORS,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  WEBSOCKET_MESSAGE_STATUS_COMPLETED,
  WEBSOCKET_MESSAGE_STATUS_ERROR
} from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { RepoSettingsSnapshotClass } from '../../classes/repo-settings-snapshot.class';
import { RepoSettingsSnapshotInterface } from '../../interfaces/repo-settings-snapshot.interface';
import { ToolsService } from '../../services/tools.service';

/**
 * Component used for setting up repository settings
 *
 * @export
 * @class RepositorySettingsComponent
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-repository-settings',
  templateUrl: './repository-settings.component.html',
  styleUrls: [
    './repository-settings.component.scss'
  ]
})
export class RepositorySettingsComponent {
  // Used to pass form group object to html to allow for fields to be filled out
  repository_settings_form_group: FormGroup;
  // Used to signify if update is allowed and passed to html
  update_allowed: boolean;

  /**
   * Creates an instance of RepositorySettingsComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {ToolsService} tools_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service_
   * @memberof RepositorySettingsComponent
   */
  constructor(private form_builder_: FormBuilder,
              private tools_service_: ToolsService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService) {
    this.update_allowed = true;
  }

  /**
   * Used for initial setup
   *
   * @memberof RepositorySettingsComponent
   */
  ngOnInit(): void {
    this.setup_websocket_onbroadcast_();
    this.api_get_repo_settings_snapshot_();
  }

  /**
   * Used for linking private api method call to a public
   * method html can interact with
   * note - form submission method used to process new MinIO settings
   *
   * @memberof RepositorySettingsComponent
   */
  update_button_click(): void {
    this.update_allowed = false;
    const repo_settings_snapshot: RepoSettingsSnapshotInterface = this.repository_settings_form_group.getRawValue() as RepoSettingsSnapshotInterface;
    this.api_repo_settings_snapshot_(repo_settings_snapshot);
  }

  /**
   * Used for displaying error message for a form field
   *
   * @param {(FormControl | AbstractControl)} form_control
   * @return {string}
   * @memberof RepositorySettingsComponent
   */
  get_error_message(form_control: FormControl | AbstractControl): string {
    return form_control.errors ? form_control.errors.error_message : '';
  }

  /**
   * Used for setting up the repository settings form group
   *
   * @private
   * @param {RepoSettingsSnapshotClass} repo_settings_snapshot
   * @memberof RepositorySettingsComponent
   */
  private initialize_repository_settings_form_group_(repo_settings_snapshot: RepoSettingsSnapshotClass) {
    const repository_settings_form_group: FormGroup = this.form_builder_.group({
      ip_address: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.ip_address) ? repo_settings_snapshot.ip_address : '', Validators.compose([validateFromArray(COMMON_VALIDATORS.isValidIP)])),
      protocol: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.protocol) ? repo_settings_snapshot.protocol : 'http', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      bucket: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.bucket) ? repo_settings_snapshot.bucket : 'tfplenum', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      username: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.username) ? repo_settings_snapshot.username : '', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      password: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.password) ? repo_settings_snapshot.password : '', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      port: new FormControl(ObjectUtilitiesClass.notUndefNull(repo_settings_snapshot.port) ? repo_settings_snapshot.port : 9001, Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]))
    });
    this.set_repositiry_settings_form_group_(repository_settings_form_group);
  }

  /**
   * Used for setting repository settings form group with passed value
   *
   * @private
   * @param {FormGroup} repository_settings_form_group
   * @memberof RepositorySettingsComponent
   */
  private set_repositiry_settings_form_group_(repository_settings_form_group: FormGroup): void {
    this.repository_settings_form_group = repository_settings_form_group;
  }


  /**
   * Used for setting up onbroadcast for websocket message responses
   * TODO - properly handle when websocket defined
   *
   * @private
   * @memberof RepositorySettingsComponent
   */
  private setup_websocket_onbroadcast_(): void {
    this.websocket_service_.onBroadcast()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NotificationClass) => {
          /* istanbul ignore else */
          if (response.status === WEBSOCKET_MESSAGE_STATUS_COMPLETED || response.status === WEBSOCKET_MESSAGE_STATUS_ERROR) {
            this.update_allowed = true;
          }
        });
  }

  /**
   * Used for making api rest call to get repo settings snapshot
   *
   * @private
   * @memberof RepositorySettingsComponent
   */
  private api_get_repo_settings_snapshot_(): void {
    this.tools_service_.get_repo_settings_snapshot()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RepoSettingsSnapshotClass) => {
          this.initialize_repository_settings_form_group_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `retrieving repository settings snapshot`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call for repo settings snapshot
   *
   * @private
   * @param {RepoSettingsSnapshotInterface} repo_settings_snapshot
   * @memberof RepositorySettingsComponent
   */
  private api_repo_settings_snapshot_(repo_settings_snapshot: RepoSettingsSnapshotInterface): void {
    this.tools_service_.repo_settings_snapshot(repo_settings_snapshot)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.mat_snackbar_service_.displaySnackBar('Updating repository settings. Check notifications for progress.', MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.update_allowed = true;
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `updating repository settings snapshot`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
