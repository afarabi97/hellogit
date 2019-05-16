import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlInput } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-textarea-input',
  templateUrl: './textarea-input.component.html',
  styleUrls: ['./textarea-input.component.css']
})
export class TextAreaInputComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  constructor() { }

  ngOnInit() { }
  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }  

  get input_control(): HtmlInput {
    return this.parentForm.get(this.controlName) as HtmlInput;
  }

}
