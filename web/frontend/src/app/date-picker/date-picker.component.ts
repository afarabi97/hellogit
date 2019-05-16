import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlDatePicker } from '../html-elements';
import { NgbDate } from "@ng-bootstrap/ng-bootstrap";
import { DatePickerService} from "./date-picker.service";

declare var $: any;

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  constructor(public _DatePickerService: DatePickerService) {
  }

  ngOnInit() {
    this.setUTCDate();
  }

  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    const selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  get input_control(): HtmlDatePicker {
    return this.parentForm.get(this.controlName) as HtmlDatePicker;
  }

  setUTCDate() {
    this._DatePickerService.setDate();
  }
}
