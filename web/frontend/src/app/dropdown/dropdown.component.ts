import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms'
import { HtmlDropDown } from '../html-elements'

declare var $: any;

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  @Output()
  dropDownChanged: EventEmitter<any> = new EventEmitter();  

  htmlDropDown: HtmlDropDown;

  constructor() {
  }

  ngOnInit() {
    this.htmlDropDown = this.parentForm.get(this.controlName) as HtmlDropDown;
    if (this.htmlDropDown.value === null || this.htmlDropDown.value === ''){
      this.selectValue(this.htmlDropDown.default_value);
    }
  }

  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  selectValue(newValue: string){
    this.htmlDropDown.setValue(newValue);
    this.triggerChangedEvent();
  }

  get input_control(): HtmlDropDown {
    return this.parentForm.get(this.controlName) as HtmlDropDown;
  }

  private triggerChangedEvent(){
    this.dropDownChanged.emit(this.htmlDropDown.value);
  }
}
