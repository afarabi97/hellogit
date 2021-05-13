import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { SystemVersionClass } from './classes';
import { PMO_SUPPORT_TITLE } from './constants/pmo-support.constant';
import { SystemVersionService } from './services/system-version.service';

/**
 * Component used for displaying pmo support information
 *
 * @export
 * @class PmoSupportComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-pmo-support',
  templateUrl: './pmo-support.component.html',
  styleUrls: ['./pmo-support.component.css']
})
export class PmoSupportComponent implements OnInit {
  // Used for passing the system version info to display within html
  system_version: SystemVersionClass;

  /**
   * Creates an instance of PmoSupportComponent.
   *
   * @param {Title} title_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {SystemVersionService} system_version_service_
   * @memberof PmoSupportComponent
   */
  constructor(private title_: Title,
              private mat_snackbar_service_: MatSnackBarService,
              private system_version_service_: SystemVersionService) { }

  /**
   * Used for setting up subscriptions
   *
   * @memberof PmoSupportComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(PMO_SUPPORT_TITLE);
    this.api_get_system_version_();
  }

  /**
   * Used for making api rest call to get system version
   *
   * @private
   * @memberof PmoSupportComponent
   */
  private api_get_system_version_(): void {
    this.system_version_service_.get_system_version()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SystemVersionClass) => this.system_version = response,
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving system version';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}
