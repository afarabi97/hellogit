import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ConfigMapClass, ObjectUtilitiesClass } from '../../classes';
import { ConfirmActionPopup } from '../../classes/ConfirmActionPopup';
import {
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_800PX,
  DIALOG_WIDTH_80VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import {
  BackingObjectInterface,
  ConfirmActionConfigurationInterface,
  KeyStringValueStringPairInterface,
  TextEditorConfigurationInterface
} from '../../interfaces';
import { DialogFormControl, DialogFormControlConfigClass } from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { UserService } from '../../services/user.service';
import { NGXMonacoTextEditorComponent } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.component';
import { AssociatedPodClass } from './classes/associated-pod.class';
import { ConfigMapEditClass } from './classes/config-map-edit.class';
import { KubernetesConfigClass } from './classes/kubernetes-config.class';
import { CLOSE_CONFIRM_ACTION_CONFIGURATION, CONFIG_MAPS_TITLE } from './constants/config-map.constant';
import { ConfigMapSaveInterface } from './interfaces/config-map-save.interface';
import { ConfigMapService } from './services/config-map.service';

/**
 * Component used for interacting with kubernetes config maps
 *
 * @export
 * @class ConfigmapsComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-config-map',
  templateUrl: './config-map.component.html',
  styleUrls: [
    './config-map.component.scss'
  ]
})
export class ConfigmapsComponent implements OnInit {
  // Used for passing column names to config map data table
  readonly config_map_data_columns = [ 'filename', 'actions' ];
  // Used for passing column names to config map table
  readonly config_map_columns = [ 'namespace', 'config_name', 'creation_date' ];
  // Used for displaying progress bar until config maps loaded
  loading: boolean;
  // Used for passing config maps to html table
  config_maps: ConfigMapClass[];
  // Used for keeping track of row expanded panel visibility
  config_map_visible: boolean[];
  // Used for disabling or allowing particular button or features to controller maintainer
  controller_maintainer: boolean;

  /**
   * Creates an instance of ConfigmapsComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {FormBuilder} form_builder_
   * @param {ConfirmActionPopup} confirm_action_popup_
   * @param {ConfigMapService} config_map_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {UserService} user_service_
   * @memberof ConfigmapsComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private form_builder_: FormBuilder,
              private confirm_action_popup_: ConfirmActionPopup,
              private config_map_service_: ConfigMapService,
              private mat_snackbar_service_: MatSnackBarService,
              private user_service_: UserService) {
    this.config_map_visible = [];
    this.config_maps = [];
    this.controller_maintainer = this.user_service_.isControllerMaintainer();
  }

  /**
   * Used for initializing data on component creation
   *
   * @memberof ConfigmapsComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(CONFIG_MAPS_TITLE);
    this.loading = true;
    this.api_get_config_maps_();
  }

  /**
   * Used for retrieving config map data keys
   *
   * @param {KeyStringValueStringPairInterface} config_map_data
   * @returns {string[]}
   * @memberof ConfigmapsComponent
   */
  config_map_data_keys(config_map_data: KeyStringValueStringPairInterface): string[] {
    return Object.keys(config_map_data);
  }

  /**
   * Used for checking if config map data is defined
   *
   * @param {ConfigMapClass} config
   * @returns {boolean}
   * @memberof ConfigmapsComponent
   */
  is_config_map_data_defined(config: ConfigMapClass): boolean {
    return ObjectUtilitiesClass.notUndefNull(config.data);
  }

  /**
   * Used for toggeling an config map expantion detail row
   *
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  toggle_table_row_expansion(config_map: ConfigMapClass): void {
    const config_map_index: number = this.get_config_map_index_(config_map);
    this.config_map_visible[config_map_index] = !this.config_map_visible[config_map_index];
  }

  /**
   * Used for checking if a config map table expantion detail row is visible
   *
   * @param {ConfigMapClass} config_map
   * @returns {boolean}
   * @memberof ConfigmapsComponent
   */
  is_config_map_expansion_row_visible(config_map: ConfigMapClass): boolean {
    const config_map_index: number = this.get_config_map_index_(config_map);

    return this.config_map_visible[config_map_index];
  }

  /**
   * Used for editting a config map data
   *
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  edit_config_map_data(config_map_data_name: string, config_map: ConfigMapClass): void {
    this.api_get_associated_pods_(config_map.data[config_map_data_name], config_map_data_name, config_map);
  }

  /**
   * Used for viewing a config map data
   *
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  view_config_map_data(config_map_data_name: string, config_map: ConfigMapClass): void {
    this.open_text_editor_(config_map_data_name, config_map, '');
  }

  /**
   * Used for creating a config map data
   *
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  create_config_map_data(config_map: ConfigMapClass): void {
    const name_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    name_form_control_config.label = 'Name';
    name_form_control_config.formState = '';
    name_form_control_config.validatorOrOpts = [
      Validators.minLength(3), Validators.required, Validators.pattern('^[^<>:;,?"*|/]+$')
    ];
    const config_map_data_form_group: FormGroup = this.form_builder_.group({
      name: new DialogFormControl(name_form_control_config)
    });
    const backing_object: BackingObjectInterface = {
      title: 'Add Config Map Data',
      instructions: 'Please add filename for the config map data.',
      dialogForm: config_map_data_form_group,
      confirmBtnText: 'Continue'
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_800PX,
      data: backing_object
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_get_associated_pods_('', response.controls['name'].value, config_map);
          }
        });
  }

  /**
   * Used for deleting config map data
   *
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  delete_config_map_data(config_map_data_name: string, config_map: ConfigMapClass): void {
    this.confirm_action_popup_.confirmAction(
      `Delete config map data: ${config_map_data_name}`,
      'Are you sure you want to remove this data entry from the config map?',
      'Delete',
      `Deleting config map data: ${config_map_data_name}`,
      `Could not delete config map data: ${config_map_data_name}`,
      () => this.api_get_associated_pods_(undefined, config_map_data_name, config_map)
    );
  }

  /**
   * Used for opening up the text editor to edit a config map data
   *
   * @private
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @param {string} save_message
   * @param {AssociatedPodClass[]} [associated_pods=[]]
   * @memberof ConfigmapsComponent
   */
  private open_text_editor_(config_map_data_name: string, config_map: ConfigMapClass, save_message: string, associated_pods: AssociatedPodClass[] = []): void {
    const SAVE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
      title: 'Close and save',
      message: save_message,
      confirmButtonText: 'Save',
      successText: `Saved config map data: ${config_map_data_name}`,
      failText: 'Could not save',
      useGeneralActionFunc: true,
      actionFunc: () => {}
    };
    const language: string = config_map_data_name.endsWith('.yml') ||
                             config_map_data_name.endsWith('.yaml') ? 'yaml' : 'txt';
    const text_editor_configuration: TextEditorConfigurationInterface = {
      show_options: this.controller_maintainer,
      is_read_only: !this.controller_maintainer,
      title: `${!this.controller_maintainer ? 'Viewing' : 'Editing'} config map data: ${config_map_data_name}`,
      text: ObjectUtilitiesClass.notUndefNull(config_map.data) &&
            ObjectUtilitiesClass.notUndefNull(config_map.data[config_map_data_name]) ?
              config_map.data[config_map_data_name] : '',
      use_language: language,
      disable_save: !this.controller_maintainer,
      confirm_save: SAVE_CONFIRM_ACTION_CONFIGURATION,
      confirm_close: CLOSE_CONFIRM_ACTION_CONFIGURATION
    };
    const mat_dialog_ref: MatDialogRef<NGXMonacoTextEditorComponent, any> = this.mat_dialog_.open(NGXMonacoTextEditorComponent, {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: text_editor_configuration,
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response)) {
            this.api_edit_config_map_(response, config_map_data_name, config_map, associated_pods);
          }
        });
  }

  /**
   * Used for getting the index of a config map from array of config maps
   *
   * @private
   * @param {ConfigMapClass} config_map
   * @returns {number}
   * @memberof ConfigmapsComponent
   */
  private get_config_map_index_(config_map: ConfigMapClass): number {
    return this.config_maps.indexOf(config_map);
  }

  /**
   * Used for making api rest call to get config maps
   *
   * @private
   * @memberof ConfigmapsComponent
   */
  private api_get_config_maps_(): void {
    this.config_map_service_.get_config_maps()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: KubernetesConfigClass) => {
          this.config_maps = response.items;
          this.config_map_visible = new Array(this.config_maps.length).fill(false);
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting config maps';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to edit config map
   *
   * @private
   * @param {string} config_map_data
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @param {AssociatedPodClass[]} associated_pods
   * @memberof ConfigmapsComponent
   */
  private api_edit_config_map_(config_map_data: string, config_map_data_name: string, config_map: ConfigMapClass, associated_pods: AssociatedPodClass[]): void {
    const config_map_edit: ConfigMapClass = [config_map].map((c: ConfigMapClass) => c)[0];
    let ced_success_value: string = '';
    let ced_error_value: string = '';
    if (ObjectUtilitiesClass.notUndefNull(config_map_data)) {
      if (ObjectUtilitiesClass.notUndefNull(config_map_edit.data)) {
        if (ObjectUtilitiesClass.notUndefNull(config_map_edit.data[config_map_data_name])) {
          ced_success_value = 'edited';
          ced_error_value = 'editing';
        } else {
          ced_success_value = 'created';
          ced_error_value = 'creating';
        }
        config_map_edit.data[config_map_data_name] = config_map_data;
      } else {
        ced_success_value = 'created';
        ced_error_value = 'creating';
        config_map_edit.data = {};
        config_map_edit.data[config_map_data_name] = config_map_data;
      }
    } else {
      delete config_map_edit.data[config_map_data_name];
      /* istanbul ignore else */
      if (Object.keys(config_map_edit.data).length === 0) {
        config_map_edit.data = null;
      }
      ced_success_value = 'deleted';
      ced_error_value = 'deleting';
    }
    const config_map_save: ConfigMapSaveInterface = {
      configMap: config_map_edit,
      associatedPods: associated_pods
    };
    this.config_map_service_.edit_config_map(config_map_save)
      .subscribe(
        (response: ConfigMapEditClass) => {
          const config_map_index: number = this.get_config_map_index_(config_map);
          this.config_maps[config_map_index] = config_map_edit;
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(this.config_maps[config_map_index].data) &&
              Object.keys(this.config_maps[config_map_index].data).length > 1) {
            // Used to sort data key values
            this.config_maps[config_map_index].data = Object.entries(this.config_maps[config_map_index].data)
              .sort()
              .reduce((obj, [key, value]) => Object.assign(obj, {[key]: value}), {});
          }
          this.config_map_visible[config_map_index] = true;
          const message: string = `${ced_success_value} config map data: ${config_map_data_name}`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message);
        },
        (error: HttpErrorResponse) => {
          const message: string = `${ced_error_value} config map data: ${config_map_data_name}`;
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get associated pods
   *
   * @private
   * @param {string} config_map_data_name
   * @param {ConfigMapClass} config_map
   * @memberof ConfigmapsComponent
   */
  private api_get_associated_pods_(config_map_data: string, config_map_data_name: string, config_map: ConfigMapClass): void {
    this.config_map_service_.get_associated_pods(config_map.metadata.name)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AssociatedPodClass[]) => {
          if (ObjectUtilitiesClass.notUndefNull(config_map_data)) {
            let message = 'Are you sure you want to save this configuration? Doing so will cause ';

            response.forEach((ap: AssociatedPodClass, i: number) => {
              message += ap.podName;
              /* istanbul ignore else */
              if (i !== (response.length - 1)) {
                message += ', ';
              }
            });
            message += ' to bounce on your Kubernetes cluster which will bring certain services down for a couple of minutes.';

            this.open_text_editor_(config_map_data_name, config_map, message, response);
          } else {
            this.api_edit_config_map_(undefined, config_map_data_name, config_map, response);
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = `getting associated pods: ${config_map.metadata.name}`;
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
