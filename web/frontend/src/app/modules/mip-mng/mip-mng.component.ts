import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  ErrorMessageClass,
  GenericJobAndKeyClass,
  MipSettingsClass,
  NodeClass,
  ObjectUtilitiesClass,
  PostValidationClass,
  ValidationErrorClass
} from '../../classes';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  CREATE,
  DEPLOY,
  DIALOG_WIDTH_1000PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  MIP
} from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import { KitSettingsService } from '../../services/kit-settings.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { NodeInfoDialogComponent } from '../global-components/components/node-info-dialog/node-info-dialog.component';
import {
  NodeStateProgressBarComponent
} from '../global-components/components/node-state-progress-bar/node-state-progress-bar.component';
import { AddMipDialogComponent } from './components/add-mip-dialog/add-mip-dialog.component';
import { MIP_MANAGEMENT_TITLE, MIP_TABLE_COLUMNS } from './constants/mip-mang.constant';

/**
 * Component used for mip related methods
 *
 * @export
 * @class MipManagementComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-mip-mng',
  templateUrl: './mip-mng.component.html'
})
export class MipManagementComponent implements OnInit {
  // Used by a parent component
  @ViewChildren('progressCircles') public progress_circles: NodeStateProgressBarComponent[];
  // Used for passing list of columns to be displayed with html table
  mip_columns: string[];
  // Used for sending table data to html
  mips: NodeClass[];
  // Used for storing mip settings
  private mip_settings_: Partial<MipSettingsClass>;

  /**
   * Creates an instance of MipManagementComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {Title} title_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} web_socket_service_
   * @memberof MipManagementComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private title_: Title,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private web_socket_service_: WebsocketService) {
    this.mip_columns = MIP_TABLE_COLUMNS;
    this.mips = [];
    this.mip_settings_ = {};
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof MipManagementComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(MIP_MANAGEMENT_TITLE);
    this.websocket_get_socket_on_node_state_change_();
    this.api_get_nodes_();
    this.api_get_mip_settings_();
  }

  /**
   * Used for opening a dialog window to display mip info
   *
   * @param {NodeClass} mip
   * @memberof MipManagementComponent
   */
  open_mip_info_dialog_window(mip: NodeClass): void {
    this.mat_dialog_.open(NodeInfoDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      data: mip
    });
  }

  /**
   * Used to see if a node can be deleted
   *
   * @param {NodeClass} node
   * @return {boolean}
   * @memberof MipManagementComponent
   */
  can_delete_node(node: NodeClass): boolean {
    for (const job of node.jobs) {
      /* istanbul ignore else */
      if (job.name === CREATE) {
        return job.complete || job.error;
      }
    }
    return true;
  }

  /**
   * Used for opening a dialog window to confirm deleting node
   *
   * @param {NodeClass} mip
   * @memberof MipManagementComponent
   */
  open_delete_node_confirm_dialog_window(mip: NodeClass): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Delete ${mip.hostname}?`,
      message: `Are you sure you want delete ${mip.hostname}?`,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      data: confirm_dialog
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            mip.isRemoving = true;
            this.api_delete_node_(mip);
          }
        });
  }

  /**
   * Used for disabling the add mip button
   *
   * @return {boolean}
   * @memberof MipManagementComponent
   */
  disable_add_mip_button(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.mip_settings_) ? Object.keys(this.mip_settings_).length === 0 : true;
  }

  /**
   * Used for opening a dialog window to add mip
   *
   * @memberof MipManagementComponent
   */
  open_add_mip_dialog_window(): void {
    const mat_dialog_ref: MatDialogRef<AddMipDialogComponent, any> = this.mat_dialog_.open(AddMipDialogComponent, {
      width: DIALOG_WIDTH_1000PX,
      disableClose: true
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_add_mip_(response);
          }
        });
  }

  /**
   * Used for updating mip data displayed within a table
   *
   * @private
   * @param {NodeClass[]} nodes
   * @memberof MipManagementComponent
   */
  private update_mips_data_(nodes: NodeClass[]): void {
    const mips: NodeClass[] = [];
    for (const node of nodes) {
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(node.jobs)) {
        for (const job of node.jobs) {
          /* istanbul ignore else */
          if (job.name === DEPLOY) {
            node.isDeployed = job.complete;
          }
        }
      }
      /* istanbul ignore else */
      if (node.node_type === MIP) {
        mips.push(node);
      }
    }
    this.set_mips_(mips);
  }

  /**
   * Used for setting mip data displayed in html table
   *
   * @private
   * @param {NodeClass[]} mips
   * @memberof MipManagementComponent
   */
  private set_mips_(mips: NodeClass[]): void {
    this.mips = mips;
  }

  /**
   * Used for constructing message displayed in a snackbar for post validation object
   *
   * @private
   * @param {object} post_validation
   * @param {string[]} post_validation_keys
   * @return {string}
   * @memberof MipManagementComponent
   */
  private construct_post_validation_error_message_(post_validation: object, post_validation_keys: string[]): string {
    let message: string = '';
    post_validation_keys.forEach((key: string, index: number) => {
      const errors: string[] = post_validation[key];
      errors.forEach((error: string, index_error: number) => {
        message += `${key}:     ${error}`;
        /* istanbul ignore else */
        if (index_error !== (errors.length - 1)) {
          message += `\n`;
        }
      });
      /* istanbul ignore else */
      if (index !== (post_validation_keys.length - 1)) {
        message += `\n\n`;
      }
    });

    return message;
  }

  /**
   * Used for setting up websocket on node state change so that html table data is updated
   *
   * @private
   * @memberof MipManagementComponent
   */
  private websocket_get_socket_on_node_state_change_(): void {
    this.web_socket_service_.getSocket().on('node-state-change', (data: NodeClass[]) => this.update_mips_data_(data));
  }

  /**
   * Used for making api rest call to get nodes
   *
   * @private
   * @memberof MipManagementComponent
   */
  private api_get_nodes_(): void {
    this.kit_settings_service_.getNodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeClass[]) => {
          this.update_mips_data_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving nodes';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get mip settings
   *
   * @private
   * @memberof MipManagementComponent
   */
  private api_get_mip_settings_(): void {
    this.kit_settings_service_.getMipSettings()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: MipSettingsClass) => {
          this.mip_settings_ = response;
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving mip settings';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to add mip
   *
   * @private
   * @param {FormGroup} node_form_group
   * @memberof MipManagementComponent
   */
  private api_add_mip_(node_form_group: FormGroup): void {
    this.kit_settings_service_.addMip(node_form_group.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = 'requested add mip';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | ValidationErrorClass | PostValidationClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (error instanceof ValidationErrorClass) {
            const field_keys: string[] = Object.keys(error.messages);
            let error_message: string = '';

            field_keys.forEach((key: string, key_index: number) => {
              error.messages[key].forEach((message: string, error_message_index: number) => {
                error_message += `${key}: ${message}`;

                if (((error.messages[key].length - 1) < error_message_index) && ((field_keys.length - 1) < key_index)) {
                  error_message += '\n';
                }
              });
              this.mat_snackbar_service_.displaySnackBar(error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            });
          } else if (error instanceof PostValidationClass) {
            if (error.post_validation instanceof Array) {
              let error_message: string;
              const post_validation_length: number = error.post_validation.length - 1;
              error.post_validation.forEach((message: string, index: number) => {
                error_message += message;
                /* istanbul ignore else */
                if (index < post_validation_length) {
                  error_message += '\n';
                }
              });
              this.mat_snackbar_service_.displaySnackBar(error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else if (typeof error.post_validation === 'object') {
              const post_validation: object = error.post_validation;
              const post_validation_keys: string[] = Object.keys(post_validation);
              const message: string = this.construct_post_validation_error_message_(post_validation, post_validation_keys);
              this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'Post validation message was not returned in correct format';
              this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          } else {
            const message: string = 'adding mip';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to delete node
   *
   * @private
   * @param {NodeClass} node
   * @memberof MipManagementComponent
   */
  private api_delete_node_(node: NodeClass): void {
    this.kit_settings_service_.deleteNode(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (respopnse: GenericJobAndKeyClass) => {
          const message: string = 'requested delete node';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting nodes';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}
