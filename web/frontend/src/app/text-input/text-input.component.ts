import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HtmlInput } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css']
})
export class TextInputComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  public uid: string;

  @Output()
  buttonClick: EventEmitter<any> = new EventEmitter();

  @Output()
  keyupEvent: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() { }
  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  callParent(){
    this.buttonClick.emit(null);
  }

  callParentKeyUp(event: any){
    this.keyupEvent.emit(event);
  }

  get input_control(): HtmlInput {
    return this.parentForm.get(this.controlName) as HtmlInput;
  }

}
