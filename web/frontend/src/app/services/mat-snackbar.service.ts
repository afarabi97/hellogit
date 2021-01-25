import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatSnackbarConfigurationClass, ObjectUtilitiesClass } from '../classes';
import { MatSnackbarServiceInterface } from '../interfaces';

/**
 * Service used for displaying and destroying mat snackbar
 *
 * @export
 * @class MatSnackBarService
 */
@Injectable({
  providedIn: 'root'
})
export class MatSnackBarService implements MatSnackbarServiceInterface, OnDestroy {
  // Ref to a snackbar
  private matSnackBarRef_: MatSnackBarRef<SimpleSnackBar>;
  // Used for subscriptions
  private ngUnsubscribe$_: Subject<void> = new Subject<void>();

  /**
   * Creates an instance of MatSnackBarService.
   *
   * @param {MatSnackBar} matSnackBar_
   * @memberof MatSnackBarService
   */
  constructor(private matSnackBar_: MatSnackBar) {}

  /**
   * Handles unsubscribing to subscriptions
   *
   * @memberof MatSnackBarService
   */
  ngOnDestroy(): void {
    this.ngUnsubscribe$_.next();
    this.ngUnsubscribe$_.complete();
  }

  /**
   * Used to display a snackbar
   *
   * @param {string} message
   * @param {MatSnackbarConfigurationClass} [matSnackbarConfigurationClass]
   * @memberof MatSnackBarService
   */
  displaySnackBar(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void {
    const matSnackBarConfig = new MatSnackBarConfig();
    this.destroySnackBar();
    if (ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass)) {
      matSnackBarConfig.duration = ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass.timeInMS) ?
        matSnackbarConfigurationClass.timeInMS : 3000;
      matSnackBarConfig.panelClass = ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass.panelClass) ?
        [matSnackbarConfigurationClass.panelClass] : [];
      if (ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass.actionLabel) &&
          ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass.action)) {
        this.matSnackBarRef_ = this.matSnackBar_.open(message, matSnackbarConfigurationClass.actionLabel, matSnackBarConfig);
        this.matSnackBarRef_.onAction()
          .pipe(takeUntil(this.ngUnsubscribe$_))
          .subscribe(matSnackbarConfigurationClass.action);
      } else {
        if (ObjectUtilitiesClass.notUndefNull(matSnackbarConfigurationClass.actionLabel)) {
          this.matSnackBar_.open(message, matSnackbarConfigurationClass.actionLabel, matSnackBarConfig);
        } else {
          this.matSnackBar_.open(message, 'Close', matSnackBarConfig);
        }
      }
    } else {
      this.matSnackBar_.open(message, 'Close');
    }
  }

  /**
   * Used to dismiss a snackbar
   *
   * @memberof MatSnackBarService
   */
  destroySnackBar(): void {
    /* instanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.matSnackBarRef_)) {
      this.matSnackBarRef_.dismiss();
      this.matSnackBarRef_ = undefined;
    }
  }
}
