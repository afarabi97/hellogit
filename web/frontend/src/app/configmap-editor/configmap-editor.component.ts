import { Component, OnInit, Input, ViewChild, 
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { ConfirmActionPopup } from '../classes/ConfirmActionPopup'

@Component({
  selector: 'app-configmap-editor',
  templateUrl: './configmap-editor.component.html',
  styleUrls: ['./configmap-editor.component.css']
})
export class ConfigmapEditorComponent implements OnInit {

  @ViewChild('editorCard')
  private editorCard: ElementRef;

  @ViewChild('outerCard')
  private outerCard: ElementRef;

  @Input()
  public title: string;

  @Input()
  public text: string;

  @Output()
  closeNoSaveEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  closeSaveEvent: EventEmitter<any> = new EventEmitter();

  numbers: Array<number>;

  constructor( private confirmer: ConfirmActionPopup) {
    this.numbers = new Array(1000).fill(true);
  }

  /**
   * Triggers when the browser window resizes.
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event){
     this.resizeEditor();
  }

  ngOnInit() {
    this.resizeEditor();
  }

  private resizeEditor(){
    let height: string = "";
    if (window.innerHeight > 400){
      height = (window.innerHeight - 130) + "px";
    } else {
      height = "100px";
    }
    this.outerCard.nativeElement.style.maxHeight = height;
    this.outerCard.nativeElement.style.height = height;
  }

  openCloseDialog(){
    this.confirmer.confirmAction(
      "Close without saving",
      "Are you sure you want to close this editor? All changes will be discarded.", 
      "Close", 
      "Closed without saving.",
      "",
      () => { this.closeWithoutSaving("") }
    );
  }

  openSaveDialog(){
    this.confirmer.confirmAction(
      "Close and save",
      "Are you sure you want to save this configuration?",
      "Save", 
      "Saved configuration file " + this.title,
      "Could not save.",
      () => { this.closeAndSave() } 
    );
  }

  closeWithoutSaving(event: any){
    this.closeNoSaveEvent.emit(event);
  }

  closeAndSave() {
    this.closeSaveEvent.emit(this.text);
  }
}
