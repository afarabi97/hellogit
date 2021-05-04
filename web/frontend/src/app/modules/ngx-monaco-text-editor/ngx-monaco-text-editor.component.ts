import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ObjectUtilitiesClass } from '../../classes';
import { ConfirmActionPopup } from '../../classes/ConfirmActionPopup';
import { TextEditorConfigurationInterface } from '../../interfaces';
import { CLOSE_DEFAULT_TOOLTIP, SAVE_DEFAULT_TOOLTIP } from './constants/ngx-monaco-editor.constants';

/**
 * Component used for displaying ngx code editor within the browser
 *
 * @export
 * @class NGXMonacoTextEditorComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'cvah-ngx-monaco-text-editor',
  templateUrl: './ngx-monaco-text-editor.component.html',
  styleUrls: ['./ngx-monaco-text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NGXMonacoTextEditorComponent {
  // Used for showing the editor options
  show_options: boolean;
  // Used for setting the editor to readonly
  is_read_only: boolean;
  // Used for displaying text within the editor
  text: string;
  // Used for specifying the language associated with the text value passed
  use_language: string;
  // Used for displaying title above editor
  // note: if value not passed the title will not be shown
  title: string;
  // Used for triggering return text from child component
  get_return_text$: Subject<void> = new Subject<void>();

  /**
   * Creates an instance of NGXMonacoTextEditorComponent.
   *
   * @param {MatDialogRef<NGXMonacoTextEditorComponent>} mat_dialog_ref_
   * @param {ConfirmActionPopup} confirm_action_dialog_
   * @param {TextEditorConfigurationInterface} mat_dialog_data_
   * @memberof NGXMonacoTextEditorComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<NGXMonacoTextEditorComponent>,
              private confirm_action_dialog_: ConfirmActionPopup,
              @Inject(MAT_DIALOG_DATA) private mat_dialog_data_: TextEditorConfigurationInterface) {
    this.show_options = mat_dialog_data_.show_options;
    this.is_read_only = mat_dialog_data_.is_read_only;
    this.text = mat_dialog_data_.text;
    this.use_language = mat_dialog_data_.use_language;
    this.title = mat_dialog_data_.title;
  }

  /**
   * Check to see if title was provided
   *
   * @returns {boolean}
   * @memberof NGXMonacoTextEditorComponent
   */
  has_title(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.title);
  }

  /**
   * Used for returning the confirm title as a tooltip for save button
   *
   * @returns {string}
   * @memberof NGXMonacoTextEditorComponent
   */
  get_save_tooltip(): string {
    if (ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_save) &&
        ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_save.title)) {
      return this.mat_dialog_data_.confirm_save.title;
    } else {
      return SAVE_DEFAULT_TOOLTIP;
    }
  }

  /**
   * Used for returning the confirm title as a tooltip for close button
   *
   * @returns {string}
   * @memberof NGXMonacoTextEditorComponent
   */
  get_close_tooltip(): string {
    if (ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_close) &&
        ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_close.title)) {
      return this.mat_dialog_data_.confirm_close.title;
    } else {
      return CLOSE_DEFAULT_TOOLTIP;
    }
  }

  /**
   * Returns boolean value to disable save button
   *
   * @returns {boolean}
   * @memberof NGXMonacoTextEditorComponent
   */
  get_disabled_save(): boolean {
    return ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.disable_save) ? this.mat_dialog_data_.disable_save : false;
  }

  /**
   * Called from save button click
   *
   * @memberof NGXMonacoTextEditorComponent
   */
  save_click(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_save)) {
      const return_general_function: () => void = () => this.get_return_text_();
      this.confirm_action_dialog_.confirmAction(
        this.mat_dialog_data_.confirm_save.title,
        this.mat_dialog_data_.confirm_save.message,
        this.mat_dialog_data_.confirm_save.confirmButtonText,
        this.mat_dialog_data_.confirm_save.successText,
        this.mat_dialog_data_.confirm_save.failText,
        ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_save.useGeneralActionFunc) &&
        this.mat_dialog_data_.confirm_save.useGeneralActionFunc ?
          return_general_function : this.mat_dialog_data_.confirm_save.actionFunc
      );
    } else {
      this.get_return_text_();
    }
  }

  /**
   * Used for closing dialog ref and returning the string of text on close
   *
   * @param {string} event
   * @memberof NGXMonacoTextEditorComponent
   */
  save(event: string): void {
    this.mat_dialog_ref_.close(event);
  }

  /**
   * Called from close button click
   *
   * @memberof NGXMonacoTextEditorComponent
   */
  close_click(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.disable_save) &&
        !this.mat_dialog_data_.disable_save &&
        ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_close)) {
      const return_general_function: () => void = () => this.close_();
      this.confirm_action_dialog_.confirmAction(
        this.mat_dialog_data_.confirm_close.title,
        this.mat_dialog_data_.confirm_close.message,
        this.mat_dialog_data_.confirm_close.confirmButtonText,
        this.mat_dialog_data_.confirm_close.successText,
        this.mat_dialog_data_.confirm_close.failText,
        ObjectUtilitiesClass.notUndefNull(this.mat_dialog_data_.confirm_close.useGeneralActionFunc) &&
        this.mat_dialog_data_.confirm_close.useGeneralActionFunc ?
          return_general_function : this.mat_dialog_data_.confirm_save.actionFunc
      );
    } else {
      this.close_();
    }
  }

  /**
   * Used for closing the dialog ref and not returning a string on close
   *
   * @memberof NGXMonacoTextEditorComponent
   */
  private close_(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for triggering a return text from child component
   *
   * @private
   * @memberof NGXMonacoTextEditorComponent
   */
  private get_return_text_(): void {
    this.get_return_text$.next();
  }
}
