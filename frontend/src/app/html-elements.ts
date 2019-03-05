import { FormControl, Validators, AsyncValidatorFn, 
        ValidatorFn, AbstractControlOptions, 
        FormArray, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

declare var $: any;

/**
 * Contract that enforces properties needed for the /help page.
 */
export interface HelpPageInterface {
  description: string;
  anchor: string;
  label: string;
}

export interface FormField {
  form_name: string;
  label: string;
  description: string;
  anchor: string;
  disabled: boolean;
}

export interface TextFormField extends FormField {
  required: boolean;
  placeholder: string;
  valid_feedback: string;
  default_value: string;
  invalid_feedback: string;
}

export interface HtmlCheckBoxInterface {
  form_name: string;
  label: string;
  description: string;
  anchor: string;
  disabled: boolean;
  checked: boolean;
}

export interface HtmlDropDownInterface {
  form_name: string;
  label: string;
  options: Array<string>;
  anchor: string;
  description: string;
  default_value: string;
}

export interface HtmlInputInterface extends TextFormField {
  // form_name: string;
  // label: string;
  // placeholder: string;
  input_type: string;
  // disabled: boolean;
  html5_constraint: string | ValidatorFn;
  // invalid_feedback: string;
  // required: boolean;
  // default_value: string;
  // valid_feedback: string;
  // anchor: string;

  setDefaultValue(someValue: string);
}

export interface HtmlCardSelectorInterface {
  form_name: string;
  label: string;
  description: string;
  card_text: string;
  card_notes: string;
  invalid_feedback: string;
  is_multi_select: boolean;
  anchor: string;
}

export enum ModalType {
  general = 1,
  error,
  success,
  code,
  form
}

export interface HtmlModalPopUpInterface {
  updateModal(title: string, text: string,
    primary_button_text: string, secondary_button_text: string,
    type: ModalType);
  openModal();
  hideModal();
}

export class HtmlModalPopUp implements HtmlModalPopUpInterface {
  private _id: string;
  private _title: string;
  private _text: string;
  private _primary_button_text?: string;
  private _secondary_button_text?: string;
  private _type: ModalType;
  private _primaryButtonCssClass: string;
  private _modalForm: FormGroup;
  private _cacheData: any; //Any kind of data we want to cache.

  constructor(id: string,
  ) {
    this._id = id;
  }

  get primaryButtonCssClass(): string {
    return this._primaryButtonCssClass;
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get text(): string {
    return this._text;
  }

  get primary_button_text(): string {
    return this._primary_button_text;
  }

  get secondary_button_text(): string {
    return this._secondary_button_text;
  }

  get type(): ModalType {
    return this._type;
  }

  get modalForm(): FormGroup {
    return this._modalForm;
  }

  get cacheData(): any {
    return this._cacheData;
  }

  updateModal(title: string, text: string,
    primary_button_text: string, secondary_button_text?: string,    
    type: ModalType = ModalType.general, modalForm: FormGroup = null, cacheData: any=null) {    
    this._title = title;
    this._text = text;
    this._primary_button_text = primary_button_text;
    this._secondary_button_text = secondary_button_text;
    this._type = type;
    this._cacheData = cacheData;

    this._primaryButtonCssClass = "btn btn-primary";
    if (this._type === ModalType.error){
      this._primaryButtonCssClass = "btn btn-danger";
    }

    if (this._type === ModalType.form){
      this._modalForm = modalForm;
    } else {
      this._modalForm = null;
    }
  }

  openModal() {
    $("#" + this._id).modal({backdrop: 'static'});
  }

  hideModal() {
    $("#" + this._id).modal('hide');
  }
}

//TODO rename to archive select modal dialog.
export class HtmlModalRestoreArchiveDialog extends HtmlModalPopUp {
  private _selection: Array<Object>;
  private _isDisabled: boolean;  

  constructor(id: string) {
    super(id);
  }

  updateModalSelection(selection: Array<Object>, isPrimaryBtnDisabled=true){
    this._selection = selection;
    for (let item of this._selection){
      item["confirmArchiveDeletion"] = false;
      item["isVisible"] = false;
    }
    this._isDisabled = isPrimaryBtnDisabled;
  }

  get selection(): Array<Object> {
    return this._selection;
  }

  set isDisabled(newValue: boolean){
    this._isDisabled = newValue;
  }

  get isDisabled(): boolean {
    return this._isDisabled;
  }
}

export class HtmlModalIPSelectDialog extends HtmlModalPopUp {
  private _selection: Array<string>;
  private _isDisabled: boolean;  

  constructor(id: string) {
    super(id);
  }

  updateModalSelection(selection: Array<string>, isPrimaryBtnDisabled=true){
    this._selection = selection;
    this._isDisabled = isPrimaryBtnDisabled;
  }

  get selection(): Array<string> {
    return this._selection;
  }

  set isDisabled(newValue: boolean){
    this._isDisabled = newValue;
  }

  get isDisabled(): boolean {
    return this._isDisabled;
  }
}

export class HtmlCheckBox extends FormControl implements HtmlCheckBoxInterface, HelpPageInterface {
  anchor: string;
  checked: boolean;
  control_disabled: boolean;
  constructor(public form_name: string,
    public label: string,
    public description: string,
    disabled: boolean = false,
    checked: boolean = false
  ) {
    super('', null, null);
    this.control_disabled = disabled;
    if (this.control_disabled) {
      this.disable();
    }

    super.setValue(checked);
    this.checked = checked;
    this.anchor = 'anchor_' + form_name;
  }

  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = true;
  }

  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{
    this.control_disabled = false;
  }

}

export class HtmlDropDown extends FormControl implements HtmlDropDownInterface, HelpPageInterface {
  anchor: string;
  control_disabled: boolean;
  constructor(
    public form_name: string,
    public label: string,
    public options: Array<string>,
    public description: string,
    public default_value: string = '',
    disabled: boolean = false,
  ) {
    super('', null, null);
    this.anchor = 'anchor_' + form_name;
    super.setValue(default_value);
    this.control_disabled = disabled;
  }

  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = true;
  }

  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = false;   
  }
}

export class HtmlHidden extends FormControl {

  constructor(public form_name: string, public required: boolean){
    super('', null, null);
    if (required){
      super.setValidators(Validators.required);
    }
  }
}

function pad(n) {
  if (n < 10)
      return "0" + n;
  return n;
}

function validateDate(control: AbstractControl): ValidationErrors | null {
  let ctrlVal = '';
  let pat = new RegExp('^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$');
  if (control.value instanceof Object){
    ctrlVal = control.value['year'] + '-' + pad(control.value['month']) + '-' + pad(control.value['day']);
  } else {
    ctrlVal = control.value;
  }
  let result = pat.test(ctrlVal);
  if (!result){
    return {"custom_error": "Invalid date format.  It must be in yyyy-mm-dd format."};
  } 

  return null;
}

export class HtmlDatePicker extends FormControl implements HelpPageInterface {
  anchor: string;  

  constructor(public form_name: string,
    public label: string,
    public required: boolean,
    public description: string,
    public default_value: string = '',
    public placeholder: string = "yyyy-mm-dd",
    public valid_feedback: string = 'Valid input'
  ) {
    super('', null, null);
    let validators = [];
    if (required) {
      validators.push(Validators.required);
    }
  
    validators.push(validateDate);
    super.setValidators(validators);
    super.setValue(default_value);
    this.anchor = 'anchor_' + this.form_name;
  }
}

export class HtmlInput extends FormControl implements HtmlInputInterface, HelpPageInterface {
  anchor: string;
  control_disabled: boolean;

  constructor(public form_name: string,
    public label: string,
    public placeholder: string,
    public input_type: string,
    public html5_constraint: string | ValidatorFn,
    public invalid_feedback: string,
    public required: boolean,
    public default_value: string,
    public description: string,
    public valid_feedback: string = 'Valid input',
    disabled: boolean = false,
    public has_button: boolean = false,
    public button_text: string = 'Submit',
    public button_css: string = 'btn btn-primary',
    validatorOrOpts: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null = null, 
    asyncValidator: AsyncValidatorFn | AsyncValidatorFn[] | null = null
  ) {
    super('', validatorOrOpts, asyncValidator);
    let validators = [];
    if (required) {
      validators.push(Validators.required);
    }
    if (html5_constraint) {
      if (typeof html5_constraint === "string"){
        validators.push(Validators.pattern(html5_constraint));
      } else {
        validators.push(html5_constraint);
      }      
    }
    super.setValidators(validators);
    super.setValue(default_value);

    this.control_disabled = disabled;
    this.anchor = 'anchor_' + this.form_name;
  }

  /**
   * Override for disabling HtmlInputs
   * Angular does not allow users to submit diabled form fields but we need them
   * for form submissions in this application because disabled inputs tend to have 
   * autocaluated values.
   * 
   * @param opts 
   */
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = true;
  }
  
  /**
   * Override for enabling HtmlInputs
   * 
   * @param opts 
   */
  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{
    this.control_disabled = false;
  }

  setDefaultValue(someValue: string) {
    this.default_value = someValue;
    super.setValue(this.default_value);
  }
}

export class HtmlTextArea extends FormControl implements TextFormField, HelpPageInterface {
  anchor: string;
  control_disabled: boolean;

  constructor(public form_name: string,
    public label: string,
    public placeholder: string,    
    public default_value: string,
    public description: string,    
    public required: boolean = false,
    public html5_constraint: string | ValidatorFn = null,
    public invalid_feedback: string = 'Invalid input',
    public valid_feedback: string = 'Valid input',
    disabled: boolean = false    
  ) {
    super('');
    let validators = [];
    if (required) {
      validators.push(Validators.required);
    }    
    super.setValidators(validators);
    super.setValue(default_value);

    this.control_disabled = disabled;
    this.anchor = 'anchor_' + this.form_name;

    if (html5_constraint) {
      if (typeof html5_constraint === "string"){
        validators.push(Validators.pattern(html5_constraint));
      } else {
        validators.push(html5_constraint);
      }      
    }
  }
  
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    this.control_disabled = true;
  }
  
  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void{
    this.control_disabled = false;
  }

  setDefaultValue(someValue: string) {
    this.default_value = someValue;
    super.setValue(this.default_value);
  }
}

/**
 * Backing object for a selection box 
 */
export class HtmlCardSelector extends FormArray implements HelpPageInterface, HtmlCardSelectorInterface {
  anchor: string;
  isDisabled: boolean;

  constructor(
    public form_name: string,
    public label: string,
    public description: string,
    public card_text: string,
    public card_notes: string,
    public invalid_feedback: string,
    public is_multi_select: boolean = false,
    public default_selections: Array<string> = [],
    isDisabled: boolean = false    
  ) {
    super([], null, null);
    this.anchor = 'anchor_' + form_name;
  }

  /**
   * Overridden method so that this element is properly disabled.
   * 
   * @param opts 
   */
  disable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    // super.disable(opts);
    this.isDisabled = true;
  }

  enable(opts?: {
    onlySelf?: boolean;
    emitEvent?: boolean;
  }): void {
    super.enable(opts);
    this.isDisabled = false;
  }

}
