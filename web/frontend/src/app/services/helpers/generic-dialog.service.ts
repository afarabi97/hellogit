import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { GenericDialogComponent } from '../../modules/generic-dialog/generic-dialog.component';

/**
 * Service used as a helper service for generic dialog factory service
 *
 * @export
 * @class GenericDialogService
 * @template T
 */
export class GenericDialogService<T = undefined> {

  /**
   * Creates an instance of GenericDialogService.
   *
   * @param {MatDialogRef<GenericDialogComponent<T>, any>} generic_dialog_ref_
   * @memberof GenericDialogService
   */
  constructor(private generic_dialog_ref_: MatDialogRef<GenericDialogComponent<T>, any>) {}

  /**
   * Used to get the generic dialog title
   *
   * @type {string}
   * @memberof GenericDialogService
   */
  get title(): string {
    return this.generic_dialog_ref_.componentInstance.mat_dialog_data.title;
  }

  /**
   * Used to set the generic dialog title
   *
   * @memberof GenericDialogService
   */
  set title(title_for_set: string) {
    this.generic_dialog_ref_.componentInstance.mat_dialog_data.title = title_for_set;
  }

  /**
   * Used to get the generic dialog template
   *
   * @type {TemplateRef<any>}
   * @memberof GenericDialogService
   */
  get template(): TemplateRef<any> {
    return this.generic_dialog_ref_.componentInstance.mat_dialog_data.template;
  }

  /**
   * Used to set the generic dialog template
   *
   * @memberof GenericDialogService
   */
  set template(template_ref_for_set: TemplateRef<any>) {
    this.generic_dialog_ref_.componentInstance.mat_dialog_data.template = template_ref_for_set;
  }

  /**
   * Used to get the generic dialog context
   *
   * @type {any}
   * @memberof GenericDialogService
   */
  get context(): any {
    return this.generic_dialog_ref_.componentInstance.mat_dialog_data.context;
  }

  /**
   * Used to set the generic dialog context
   *
   * @memberof GenericDialogService
   */
  set context(context_for_set: any) {
    this.generic_dialog_ref_.componentInstance.mat_dialog_data.context = context_for_set;
  }

  /**
   * Used for returning a ref to the original mat dialog ref
   *
   * @returns {MatDialogRef<GenericDialogComponent<T>, any>}
   * @memberof GenericDialogService
   */
  dialog_ref(): MatDialogRef<GenericDialogComponent<T>, any> {
    return this.generic_dialog_ref_;
  }

  /**
   * Used to close the generic dialog ref
   *
   * @memberof GenericDialogService
   */
  close(): void {
    this.generic_dialog_ref_.close();
  }
}
