import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HtmlModalPopUp, ModalType, 
        HtmlInput, HtmlDatePicker, HtmlDropDown, HtmlTextArea } from '../html-elements';
import { FormControl } from '@angular/forms';
import { ExecuteKitForm } from "../kit-form/kit-form";
import { formatDate } from "@angular/common";
import { DatePickerService } from "../date-picker/date-picker.service";


@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css']
})
export class ModalDialogComponent implements OnInit {

  @Input()
  modal: HtmlModalPopUp;
  
  @Output()
  primaryButtonClick: EventEmitter<any> = new EventEmitter();

  constructor(public _DatePickerService: DatePickerService) {}

  ngOnInit() {}

  objectKeys(obj: any) {
    let ret_val = [];
    for (let item of Object.keys(obj)){      
        ret_val.push(item);
    }
    return ret_val;
  }

  triggerPrimaryClickEvent(event: any){    
    this.primaryButtonClick.emit(event);
  }

  onSubmit(){
    this.primaryButtonClick.emit(this.modal.modalForm.value);
    this.modal.hideModal();
  }

  isCode(){
    return this.modal.type === ModalType.code;
  }

  isGeneral(){
    return this.modal.type === ModalType.general;
  }

  isError(){
    return this.modal.type === ModalType.error;
  }

  isFormType() {
    return this.modal.type === ModalType.form;
  }

  isTextInput(formControl: FormControl){
    return formControl instanceof HtmlInput;
  }

  isDateInput(formControl: FormControl){
    return formControl instanceof HtmlDatePicker;
  }

  isDropdownInput(formControl: FormControl){
    return formControl instanceof HtmlDropDown;
  }

  isTextArea(formControl: FormControl){
    return formControl instanceof HtmlTextArea;
  }

  triggerCallback(timezone: string){
    if (this.modal.modalForm instanceof ExecuteKitForm){
      if (timezone === "Browser"){
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.modal.modalForm.timezone.setValue(timezone);
      }      
      this._DatePickerService.setDate(timezone);
      this.setTime(timezone);
    }
  }

  setTime(timezone: string='UTC'){
    if (this.modal.modalForm instanceof ExecuteKitForm){
      const date_picker = this.modal.modalForm as ExecuteKitForm;
      let date = new Date();
      let time_formated = date.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit', 
                                                        hour12: false, timeZone: timezone });
      date_picker.time.setValue(time_formated);
    }
  }
}
