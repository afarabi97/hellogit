import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MatSnackbarConfigurationClass, NotificationClass, ObjectUtilitiesClass, SuccessMessageClass } from '../../classes';
import {
  CONFIRM_DIALOG_OPTION,
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_35PERCENT,
  DIALOG_WIDTH_80VW,
  MAT_SNACKBAR_ACTION_LABEL_DISMISS,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { TextEditorConfigurationInterface } from '../../interfaces';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { UserService } from '../../services/user.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { NGXMonacoTextEditorComponent } from '../ngx-monaco-text-editor/ngx-monaco-text-editor.component';
import {
  ElasticsearchCheckClass,
  ElasticsearchConfigurationClass,
  ElasticsearchNodeClass,
  ElasticsearchNodeReturnClass,
  SliderControlClass
} from './classes';
import {
  CANT_RUN_CONFIRM_MAT_DIALOG,
  CLOSE_CONFIRM_ACTION_CONFIGURATION,
  ELASTICSEARCH_KIT_DEPLOYED_ERROR_MESSAGE,
  ELASTICSEARCH_SCALE_IN_PROGRESS_CONFIRM_MAT_DIALOG,
  ELASTICSEARCH_SCALE_TITLE,
  ELASTICSEARCH_UNKNOWN_ERROR_MESSAGE,
  RUN_CONFIRM_MAT_DIALOG,
  SAVE_CONFIRM_ACTION_CONFIGURATION,
  WEBSOCKET_STATUS_COMPLETED_ELASTIC_MESSAGE
} from './constants/elasticsearch-scale.constant';
import { NodeTitleEnum } from './enums/node-title.enum';
import {
  ElasticsearchConfigurationInterface,
  ElasticsearchNodeReturnInterface
} from './interfaces';
import { ElasticsearchService } from './services/elasticsearch.service';

/**
 * Component used for operator control over elastic functionality
 *
 * @export
 * @class ElasticsearchScaleComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-elasticsearch-scale',
  templateUrl: './elasticsearch-scale.component.html',
  styleUrls: [
    './elasticsearch-scale.component.scss'
  ]
})
export class ElasticsearchScaleComponent implements OnInit {
  // Used for passing slider configuration for elastic nodes to html
  node_sliders: SliderControlClass[];
  // Used to show current server node count
  server_node_count: number;
  // Used for disabling features within html
  status: boolean;
  // Used for turning on and off the progress bar within html
  loading: boolean;
  // Used for disabling or allowing particular button or features to controller maintainer
  private controller_maintainer_: boolean;
  // Used for disabling or allowing particular button or features to controller admin
  private controller_admin_: boolean;

  /**
   * Creates an instance of ElasticsearchScaleComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {Router} router_
   * @param {ElasticsearchService} elasticsearch_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {UserService} user_service_
   * @param {WebsocketService} websocket_service_
   * @memberof ElasticsearchScaleComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private router_: Router,
              private elasticsearch_service_: ElasticsearchService,
              private mat_snackbar_service_: MatSnackBarService,
              private user_service_: UserService,
              private websocket_service_: WebsocketService) {
    this.node_sliders = [];
    this.server_node_count = 0;
    this.status = false;
    this.loading = true;
    this.controller_maintainer_ = this.user_service_.isControllerMaintainer();
    this.controller_admin_ = this.user_service_.isControllerAdmin();
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof ElasticsearchScaleComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(ELASTICSEARCH_SCALE_TITLE);
    this.api_check_elastic_();
    this.setup_websocket_onbroadcast_();
    this.api_get_elastic_nodes_();
  }

  /**
   * Used for opening the run confirm dialog
   *
   * @memberof ElasticsearchScaleComponent
   */
  open_run_confirm_dialog(): void {
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: RUN_CONFIRM_MAT_DIALOG
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            if (this.status) {
              this.open_cant_run_dialog_();
            } else {
              this.run_elasticsearch_scale_();
            }
          }
        });
  }

  /**
   * Used for calling a private method from the html
   *
   * @memberof ElasticsearchScaleComponent
   */
  edit_elasticsearch_configuration(): void {
    this.api_get_elastic_full_config_();
  }

  /**
   * Used for setting up websocket broadcast subscription
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  // TODO - properly handle when websocket defined
  private setup_websocket_onbroadcast_(): void {
    this.websocket_service_.onBroadcast()
      .pipe(untilDestroyed(this))
      .subscribe(
        (reponse: NotificationClass) => {
          /* istanbul ignore else */
          if (reponse.status === 'COMPLETED' && reponse.message === WEBSOCKET_STATUS_COMPLETED_ELASTIC_MESSAGE) {
            this.status = false;
            this.loading = false;
            this.api_get_elastic_nodes_();
          }
        });
  }

  /**
   * Used to setup elasticsearch node scale object for api call
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private run_elasticsearch_scale_(): void {
    this.loading = true;
    const node_return: ElasticsearchNodeReturnInterface = new Object() as ElasticsearchNodeReturnInterface;
    this.node_sliders.forEach((slider_control: SliderControlClass) => node_return[slider_control.type] = slider_control.current_count);
    this.api_post_elastic_nodes_(node_return);
  }

  /**
   * Used for opening the text editor dialog window
   *
   * @private
   * @param {ElasticsearchConfigurationClass} elasticsearch_configuration
   * @memberof ElasticsearchScaleComponent
   */
  private open_text_editor_(elasticsearch_configuration: ElasticsearchConfigurationClass): void {
    const text_editor_configuration: TextEditorConfigurationInterface = {
      show_options: this.controller_maintainer_ || this.controller_admin_,
      is_read_only: !this.controller_maintainer_ || !this.controller_admin_,
      title: 'Elasticsearch Configuration',
      text: elasticsearch_configuration.elastic,
      use_language: 'yaml',
      display_save: this.controller_maintainer_ || this.controller_admin_,
      disable_save: !this.controller_maintainer_ || !this.controller_admin_,
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
            this.api_post_elastic_full_config_(response);
          }
        });
  }

  /**
   * Used for opening cant run dialog
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private open_cant_run_dialog_(): void {
    this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: CANT_RUN_CONFIRM_MAT_DIALOG
    });
  }

  /**
   * Used for opening elasticsearch scale in progress dialog
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private open_elasticsearch_scale_in_progress_dialog_(): void {
    this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: ELASTICSEARCH_SCALE_IN_PROGRESS_CONFIRM_MAT_DIALOG
    });
  }

  /**
   * Used for making api rest call to get elastic nodes
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private api_get_elastic_nodes_(): void {
    this.elasticsearch_service_.get_elastic_nodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ElasticsearchNodeClass) => {
          this.server_node_count = response.server_node_count;
          const enum_keys_: string[] = Object.keys(NodeTitleEnum);
          this.node_sliders = enum_keys_.map((v: string) => new SliderControlClass(v, response));
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting elasticsearch nodes';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post elastic nodes
   *
   * @private
   * @param {NodeReturnInterface} elasticsearch_node_return
   * @memberof ElasticsearchScaleComponent
   */
  private api_post_elastic_nodes_(elasticsearch_node_return: ElasticsearchNodeReturnInterface): void {
    this.elasticsearch_service_.post_elastic_nodes(new ElasticsearchNodeReturnClass(elasticsearch_node_return))
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.api_deploy_elastic_();
          this.node_sliders = [];
        },
        (error: HttpErrorResponse) => {
          const message: string = 'changing elasticsearch nodes';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get elastic full config
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private api_get_elastic_full_config_(): void {
    this.elasticsearch_service_.get_elastic_full_config()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ElasticsearchConfigurationClass) => this.open_text_editor_(response),
        (error: HttpErrorResponse) => {
          const message: string = 'getting elasticsearch';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post elastic full config
   *
   * @private
   * @param {string} response
   * @memberof ElasticsearchScaleComponent
   */
  private api_post_elastic_full_config_(response: string): void {
    const elasticsearch_configuration: ElasticsearchConfigurationInterface = { elastic: response };
    this.elasticsearch_service_.post_elastic_full_config(new ElasticsearchConfigurationClass(elasticsearch_configuration))
      .pipe(untilDestroyed(this))
      .subscribe(
        (response_inner: SuccessMessageClass) => {
          this.api_deploy_elastic_();
          this.node_sliders = [];
        },
        (error: HttpErrorResponse) => {
          const message: string = 'changing elasticsearch configuration';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to deploy elastic
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private api_deploy_elastic_(): void {
    setTimeout(() => {
      this.elasticsearch_service_.deploy_elastic()
        .pipe(untilDestroyed(this))
        .subscribe(
          () => this.status = true,
          (error: HttpErrorResponse) => {
            const message: string = 'deloying elasticsearch';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          });
    }, 5000);
  }

  /**
   * Used for making api rest call to check elastic
   *
   * @private
   * @memberof ElasticsearchScaleComponent
   */
  private api_check_elastic_(): void {
    this.elasticsearch_service_.check_elastic()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ElasticsearchCheckClass) => {
          if (response.status !== 'Ready' &&
              response.status !== 'Unknown' &&
              response.status !== 'None') {
            this.open_elasticsearch_scale_in_progress_dialog_();
            this.status = true;
          } else if (response.status === 'None') {
            const reroute: () => Promise<boolean> = () => this.router_.navigate(['/kit_configuration']);
            const mat_snackbar_configuration: MatSnackbarConfigurationClass = {
              timeInMS: 60000,
              actionLabel: 'Kit Config',
              action: reroute
            };
            this.mat_snackbar_service_.generate_return_error_snackbar_message(ELASTICSEARCH_KIT_DEPLOYED_ERROR_MESSAGE, mat_snackbar_configuration);
            this.loading = false;
          } else if (response.status === 'Unknown') {
            const mat_snackbar_configuration: MatSnackbarConfigurationClass = {
              timeInMS: 60000,
              actionLabel: MAT_SNACKBAR_ACTION_LABEL_DISMISS
            };
            this.mat_snackbar_service_.generate_return_error_snackbar_message(ELASTICSEARCH_UNKNOWN_ERROR_MESSAGE, mat_snackbar_configuration);
            this.loading = false;
          } else {
            this.loading = false;
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'checking elasticsearch status';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
