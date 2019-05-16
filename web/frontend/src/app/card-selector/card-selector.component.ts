import { Component, OnInit, Input, Output,
         EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HtmlCardSelector } from '../html-elements';

declare var $: any;

@Component({
  selector: 'app-card-selector',
  templateUrl: './card-selector.component.html',
  styleUrls: ['./card-selector.component.css']
})
export class CardSelectorComponent implements OnInit {

  @Input()
  public parentForm: FormGroup;

  @Input()
  public controlName: string;

  @Input()
  optionSelections: Array<{ value: string, label: string, isSelected: boolean }>;

  @Input()
  public uid: string;

  @Output()
  onSelect: EventEmitter<any> = new EventEmitter();

  @ViewChild('button_group')
  private buttonGroup: ElementRef;

  private htmlCardSelectorFormArray: HtmlCardSelector;

  constructor() { }

  ngOnInit() {
    this.htmlCardSelectorFormArray = this.parentForm.get(this.controlName) as HtmlCardSelector;
    //Fixes a bug when we rerender the same card selector.
    this.clearFormArray();
    if (this.htmlCardSelectorFormArray.default_options){
      this.optionSelections = this.htmlCardSelectorFormArray.default_options;
    }
    this.setDefaultValues(this.htmlCardSelectorFormArray.default_selections);
  }

  ngAfterViewInit(){
    this.update_tooltip();
  }

  private update_tooltip(){
    let selector = $('[name="tip_'+this.controlName+'"]')
    selector.tooltip();
  }

  private clearFormArray(){
    while(this.htmlCardSelectorFormArray.length !== 0){
      this.htmlCardSelectorFormArray.removeAt(0);
    }
  }

  private clearSelectedOptionLabels(){
    for (let i = 0; i < this.optionSelections.length; i++){
      this.optionSelections[i].label = this.optionSelections[i].label.replace(' - selected', '');
    }
  }

  public setDefaultValues(selectedOptions: Array<string>){
    this.clearFormArray();
    this.clearSelectedOptionLabels();

    for (let default_value of selectedOptions){
      this.set_selectedValue(default_value);
      for (let i = 0; i < this.optionSelections.length; i++){
        if (this.optionSelections[i].value == default_value){
          this.optionSelections[i].label = this.optionSelections[i].label + ' - selected';
        }
      }
    }
  }

  selectedButton(event, selection: { value: string, label: string, isSelected: boolean }) {
    if (!this.htmlCardSelectorFormArray.is_multi_select) {
      this.clearFormArray();
      this.clearSelectedOptionLabels();
    }

    if (selection.label.indexOf('selected') > -1){
      selection.label = selection.label.replace(' - selected', '');
    }
    let srcElement = event.srcElement;
    if (srcElement === undefined){
      srcElement = event.target;
    }

    if (srcElement.value.indexOf('selected') > -1) {
      //Only triggered when the selected word is in the value of the srcElement
      selection.isSelected = false;
      this.deSelectValue(selection.value);
    } else {
      selection.label = selection.label + ' - selected';
      selection.isSelected = true;
      this.set_selectedValue(selection.value);
    }

    this.triggerOnSelectEvent();
  }

  private triggerOnSelectEvent(){
    this.onSelect.emit(this.htmlCardSelectorFormArray.value);
  }

  private set_selectedValue(newValue: string) {
    this.htmlCardSelectorFormArray.push(new FormControl(newValue));
  }

  private deSelectValue(value: string){
    let indexToDelete: number = -1;
    for (let index=0; index <  this.htmlCardSelectorFormArray.length; index++){
      if (this.htmlCardSelectorFormArray.at(index).value == value){
        indexToDelete = index;
        break;
      }
    }
    if (indexToDelete != -1){
      this.htmlCardSelectorFormArray.removeAt(indexToDelete);
    }
  }

  get input_control(): HtmlCardSelector {
    return this.htmlCardSelectorFormArray;
  }
}
