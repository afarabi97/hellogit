import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ObjectUtilitiesClass, PortalLinkClass, UserPortalLinkClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_MAX_HEIGHT_800PX,
  DIALOG_WIDTH_800PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { BackingObjectInterface, ConfirmDialogMatDialogDataInterface, UserPortalLinkInterface } from '../../interfaces';
import { DialogFormControl, DialogFormControlConfigClass } from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { PortalService } from '../../services/portal.service';
import { UserService } from '../../services/user.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { PORTAL_TITLE, TARGET_CONFIG_VALIDATORS } from './constants/portal.constant';

/**
 * Component used for showing portal and user portal links for new window tab navigation
 *
 * @export
 * @class PortalComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {
  // Used for passing list of portal links to html
  portal_links: PortalLinkClass[];
  // Used for passing list of user portal links to html
  user_portal_links: UserPortalLinkClass[];
  // Used for retaining if user is operator
  operator: boolean;
  app_links_to_hide: Array<string>;
  hidden_app_links: Array<string>;

  /**
   * Creates an instance of PortalComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {FormBuilder} form_builder_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {PortalService} portal_service_
   * @param {UserService} user_service_
   * @memberof PortalComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private form_builder_: FormBuilder,
              private mat_snackbar_service_: MatSnackBarService,
              private portal_service_: PortalService,
              private user_service_: UserService) {
    this.app_links_to_hide = ["arkime","misp","nifi"];
    this.hidden_app_links = [];
    this.portal_links = [];
    this.user_portal_links = [];
    this.operator = this.user_service_.isOperator();
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof PortalComponent
   */
  ngOnInit() {
    this.title_.setTitle(PORTAL_TITLE);
    this.api_get_portal_links_();
    this.api_get_user_portal_links_();
  }

  /**
   * Used for opening the add user portal link dialog window
   *
   * @memberof PortalComponent
   */
  open_add_user_portal_link() {
    const nameFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    nameFormControlConfig.label = 'Link Name';
    nameFormControlConfig.formState = '';
    nameFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(TARGET_CONFIG_VALIDATORS.required)]);
    const urlFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    urlFormControlConfig.label = 'Link URL';
    urlFormControlConfig.formState = '';
    urlFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(TARGET_CONFIG_VALIDATORS.url)]);
    const descriptionFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    descriptionFormControlConfig.label = 'Link Description';
    descriptionFormControlConfig.formState = '';
    descriptionFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(TARGET_CONFIG_VALIDATORS.required)]);
    const form_group: FormGroup = this.form_builder_.group({
      name: new DialogFormControl(nameFormControlConfig),
      url: new DialogFormControl(urlFormControlConfig),
      description: new DialogFormControl(descriptionFormControlConfig),
    });
    const mat_dialog_data: BackingObjectInterface = {
      title: "Add Link",
      instructions: "Please enter link data",
      dialogForm: form_group,
      confirmBtnText: "Submit"
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: mat_dialog_data
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid){
            this.api_add_user_portal_link_(response.getRawValue() as UserPortalLinkInterface);
          }
        });
  }

  /**
   * Used for opening up the confirm remove user portal link dialog window
   *
   * @param {*} $event
   * @param {UserPortalLinkClass} user_portal_link
   * @memberof PortalComponent
   */
  open_confirm_remove_user_portal_link($event: any, user_portal_link: UserPortalLinkClass) {
    $event.stopPropagation();

    const confirm_dialog_mat_dialog_data: ConfirmDialogMatDialogDataInterface = {
      title: `Remove User Link "${user_portal_link.name}"?`,
      message: `Confirm deletion of link to ${user_portal_link.url}. This action cannot be undone.`,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: '35%',
      data: confirm_dialog_mat_dialog_data
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_remove_user_portal_link_(user_portal_link);
          }
        });
  }

  /**
   * Used for opening url within the browser
   *
   * @param {string} url
   * @memberof PortalComponent
   */
  go_to_url(url: string) {
    window.open(url, '_blank');
  }

  /**
   * Used for making api rest call to get portal links
   *
   * @private
   * @memberof PortalComponent
   */
  private api_get_portal_links_(): void {
    this.portal_service_.get_portal_links()
      .pipe(untilDestroyed(this))
      .subscribe((response: PortalLinkClass[]) => {
        this.portal_links = response
        this.get_hidden_app_links(this.portal_links)
      });
  }

  /**
   * Used for making api rest call to get user portal links
   *
   * @private
   * @memberof PortalComponent
   */
  private api_get_user_portal_links_(): void {
    this.portal_service_.get_user_links()
      .pipe(untilDestroyed(this))
      .subscribe((response: UserPortalLinkClass[]) => this.user_portal_links = response);
  }

  /**
   * Used for making api rest call to add user portal link
   *
   * @private
   * @param {UserPortalLinkInterface} user_portal_link
   * @memberof PortalComponent
   */
  private api_add_user_portal_link_(user_portal_link: UserPortalLinkInterface): void {
    this.portal_service_.add_user_link(new UserPortalLinkClass(user_portal_link))
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: UserPortalLinkClass[]) => this.user_portal_links = response,
        (error: HttpErrorResponse) => {
          const message: string = 'adding user portal link';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to remove user portal link
   *
   * @private
   * @param {UserPortalLinkClass} user_portal_link
   * @memberof PortalComponent
   */
  private api_remove_user_portal_link_(user_portal_link: UserPortalLinkClass): void {
    this.portal_service_.remove_user_link(user_portal_link)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: UserPortalLinkClass[]) => this.user_portal_links = response,
        (error: HttpErrorResponse) => {
          const message: string = 'removing user portal link';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }


    /**
   * Used for hiding link for specifc applications
   *
   * @private
   * @memberof PortalComponent
   */

  private get_hidden_app_links( portal_links:PortalLinkClass[] ): void {

      portal_links.forEach((link) => {
        const app_name = link.dns.split("/")[2].split(".")[0]
          if(this.app_links_to_hide.includes(app_name)){
            this.hidden_app_links.push(link.dns)
        }
      });
  }
}
