import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DiffEditorModel } from 'ngx-monaco-editor';
import { Subject } from 'rxjs';

import { ObjectUtilitiesClass } from '../../../../classes';
import { EDITOR_LANGAUAGES, EDITOR_THEMES, WORDWRAP } from '../../constants/ngx-monaco-editor.constants';
import { EditorOptionsInterface } from '../../interfaces/editor-options.interface';
import { SelectOptionInterface } from '../../interfaces/select-options.interface';

/**
 * Component used for editing code available to system
 *
 * @export
 * @class NGXMonacoEditorComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 * @implements {OnDestroy}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-ngx-monaco-editor',
  templateUrl: './ngx-monaco-editor.component.html',
  styleUrls: ['./ngx-monaco-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NGXMonacoEditorComponent implements OnInit, OnChanges {
  // Used for showing the editor options
  @Input() show_options: boolean;
  // Used for setting the editor to readonly
  @Input() is_read_only: boolean;
  // Used for displaying text within the editor
  @Input() text: string;
  // Used for specifying the language associated with the text value passed
  @Input() use_language: string;
  // Used for triggering text value to be passed back to parent component
  @Input() return_editor_text$: Subject<void> = new Subject<void>();
  // Used for returning modified text back to parent component
  @Output() editor_text: EventEmitter<string> = new EventEmitter<string>();
  // Used for passing current text on keyup
  @Output() keyup_text: EventEmitter<string> = new EventEmitter<string>();
  // Used for keeping copying the text input value and passing into modified editor
  text1: string;
  // Used for keeping copying the text input value and passing into original editor
  text2: string;
  // Used for turning on/off the minimap on all editors
  minimap: boolean;
  // Used for keeping compare changes checkbox value state
  compare: boolean;
  // Used for change the div's to display different editor views
  compare_mode: boolean;
  // Used for keeping inline diff checkbox value statechange  and div's to display different editor views
  inline_diff: boolean;
  // Used for retaining currently selected language
  selected_lang: string;
  // Used for retaining currently selected theme
  selected_theme: string;
  // Used for retaining currently selected wordwrap
  selected_word_wrap: string;
  // Used for passing language constants to mat-select
  languages: string[] = EDITOR_LANGAUAGES;
  // Used for passing theme constants to mat-select
  themes: SelectOptionInterface[] = EDITOR_THEMES;
  // Used for passing wordwrap constants to mat-select
  word_wraps: SelectOptionInterface[] = WORDWRAP;
  // Used for passing editor options for modified text
  modified_options: EditorOptionsInterface;
  // Used for passing editor options for original text
  original_options: EditorOptionsInterface;
  // Used for passing editor options for diff text
  diff_options: EditorOptionsInterface;
  // Used for passing the original text model into diff editor
  original_model: DiffEditorModel;
  // Used for passing the modified text model into diff editor
  modified_model: DiffEditorModel;

  /**
   * Creates an instance of NGXMonacoEditorComponent.
   *
   * @memberof NGXMonacoEditorComponent
   */
  constructor() {
    this.text1 = ``;
    this.text2 = ``;
    this.minimap = false;
    this.compare = false;
    this.compare_mode = false;
    this.inline_diff = false;
    this.selected_theme = 'vs-dark';
    this.selected_word_wrap = 'off';
    this.show_options = false;
    this.is_read_only = false;
  }

  /**
   * Used for subscribing to subscriptions and setting up variables from parent input values
   *
   * @memberof NGXMonacoEditorComponent
   */
  ngOnInit(): void {
    this.get_return_editor_text_();
    this.text1 = this.text;
    this.text2 = this.text;
    this.selected_lang = this.use_language;
    this.modified_options = {
      fontFamily: `Consolas, Monaco, 'Courier New', monospace`,
      theme: this.selected_theme,
      language: this.selected_lang,
      minimap: { enabled: false },
      wordWrap: 'off',
      readOnly: this.is_read_only,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      links: false,
      trimAutoWhitespace: false,
      insertSpaces: false
    };
    this.original_options = Object.assign({}, this.modified_options, { readOnly: true });
    this.diff_options = Object.assign({}, this.original_options, { renderSideBySide: true });
    this.original_model = {
      code: ``,
      language: this.selected_lang
    };
    this.modified_model = this.original_model;
  }

  /**
   * Used for looking for text simple change
   *
   * @param {SimpleChanges} changes
   * @memberof NGXMonacoEditorComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const text_simple_change: SimpleChange = changes['text'];
    const is_read_only_simple_change: SimpleChange = changes['is_read_only'];
    if (ObjectUtilitiesClass.notUndefNull(text_simple_change) &&
        text_simple_change.currentValue !== text_simple_change.previousValue) {
      this.text1 = this.text;
      this.text2 = this.text;
    } else if (ObjectUtilitiesClass.notUndefNull(is_read_only_simple_change) &&
               is_read_only_simple_change.currentValue !== is_read_only_simple_change.previousValue) {
      this.modified_options = Object.assign({}, this.modified_options, { readOnly: is_read_only_simple_change.currentValue });
    }
  }

  /**
   * Used for retrieving the edit option class object
   *
   * @returns {Object}
   * @memberof NGXMonacoEditorComponent
   */
  get_edit_option_class(): Object {
    return {
      'option-button': true,
      'option-button-light': this.selected_theme === 'vs',
      'option-button-dark': this.selected_theme === 'vs-dark'
    };
  }

  /**
   * Used for sending current updated text value on every keyup
   *
   * @memberof NGXMonacoEditorComponent
   */
  on_keyup(): void {
    this.keyup_text.emit(this.text1);
  }

  /**
   * Used for updating editor options and text models when language changed by user
   *
   * @param {MatSelectChange} event
   * @memberof NGXMonacoEditorComponent
   */
  selection_change_language(event: MatSelectChange): void {
    this.modified_options = Object.assign({}, this.modified_options, { language: event.value });
    this.original_options = Object.assign({}, this.original_options, { language: event.value });
    this.diff_options = Object.assign({}, this.modified_options, { language: event.value });
    this.original_model = Object.assign({}, this.original_model, { language: event.value });
    this.modified_model = Object.assign({}, this.modified_model, { language: event.value });
  }

  /**
   * Used for updating editor options when theme changed by user
   *
   * @param {MatSelectChange} event
   * @memberof NGXMonacoEditorComponent
   */
  selection_change_theme(event: MatSelectChange): void {
    this.modified_options = Object.assign({}, this.modified_options, { theme: event.value });
    this.original_options = Object.assign({}, this.original_options, { theme: event.value });
    this.diff_options = Object.assign({}, this.diff_options, { theme: event.value });
  }

  /**
   * Used for updating editor options when wordwrap changed by user
   *
   * @param {MatSelectChange} event
   * @memberof NGXMonacoEditorComponent
   */
  selection_change_word_wrap(event: MatSelectChange): void {
    this.modified_options = Object.assign({}, this.modified_options, { wordWrap: event.value });
    this.original_options = Object.assign({}, this.original_options, { wordWrap: event.value });
    this.diff_options = Object.assign({}, this.diff_options, { wordWrap: event.value });
  }

  /**
   * Used for updating editor options when minimap changed by user
   *
   * @param {MatCheckboxChange} event
   * @memberof NGXMonacoEditorComponent
   */
  change_minimap(event: MatCheckboxChange): void {
    this.modified_options = Object.assign({}, this.modified_options, { minimap: { enabled: event.checked } });
    this.original_options = Object.assign({}, this.original_options, { minimap: { enabled: event.checked } });
    this.diff_options = Object.assign({}, this.diff_options, { minimap: { enabled: event.checked } });
  }

  /**
   * Used for setting variables when compare mode selected
   *
   * @param {MatCheckboxChange} event
   * @memberof NGXMonacoEditorComponent
   */
  change_compare_mode(event: MatCheckboxChange): void {
    this.compare_mode = event.checked;
    this.inline_diff = false;
  }

  /**
   * Used for updating diff editor options and text models when inline diff selected by the user
   *
   * @param {MatCheckboxChange} event
   * @memberof NGXMonacoEditorComponent
   */
  change_inline_diff(event: MatCheckboxChange): void {
    this.original_model = Object.assign({}, this.original_model, { code: `${this.text1}` });
    this.modified_model = Object.assign({}, this.original_model, { code: `${this.text2}` });
    this.diff_options = Object.assign({}, this.diff_options, { renderSideBySide: !event.checked });
  }

  /**
   * Used for subscribing to parent subject changes
   *
   * @private
   * @memberof NGXMonacoEditorComponent
   */
  private get_return_editor_text_(): void {
    this.return_editor_text$
      .pipe(untilDestroyed(this))
      .subscribe(() => this.editor_text.emit(this.text1));
  }
}
