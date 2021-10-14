import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

import { DialogDataInterface, GenericDialogFactoryServiceInterface } from '../interfaces';
import { GenericDialogComponent } from '../modules/generic-dialog/generic-dialog.component';
import { GenericDialogService } from './helpers/generic-dialog.service';

@Injectable({
  providedIn: 'root'
})
export class GenericDialogFactoryService<T = undefined> implements GenericDialogFactoryServiceInterface<T> {

  /**
   * Creates an instance of GenericDialogFactoryService.
   *
   * @param {MatDialog} mat_dialog_
   * @memberof GenericDialogFactoryService
   */
  constructor(private mat_dialog_: MatDialog) {}

  /**
   * Used for opening mat dialog
   *
   * @param {DialogDataInterface<T>} dialog_data
   * @param {MatDialogConfig} mat_dialog_config
   * @returns {GenericDialogService<T>}
   * @memberof GenericDialogFactoryService
   */
  open(dialog_data: DialogDataInterface<T>, mat_dialog_config: MatDialogConfig): GenericDialogService<T> {
    const assembled_mat_dialog_config: MatDialogConfig = {
      ...mat_dialog_config,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<GenericDialogComponent<T>, any> =
      this.mat_dialog_.open<GenericDialogComponent<T>, DialogDataInterface<T>>(GenericDialogComponent, assembled_mat_dialog_config);

    mat_dialog_ref.afterClosed().pipe(first());

    return new GenericDialogService(mat_dialog_ref);
  }
}
