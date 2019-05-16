import { Component, OnInit, Input, ViewChild, 
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { HtmlModalPopUp } from '../html-elements';

@Component({
  selector: 'app-configmap-editor',
  templateUrl: './configmap-editor.component.html',
  styleUrls: ['./configmap-editor.component.css']
})
export class ConfigmapEditorComponent implements OnInit {

  @ViewChild('editorCard')
  private editorCard: ElementRef;

  @Input()
  public title: string;

  @Input()
  public text: string;

  @Output()
  closeNoSaveEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  closeSaveEvent: EventEmitter<any> = new EventEmitter();

  closeModal: HtmlModalPopUp;
  saveModal: HtmlModalPopUp;

  constructor() { 
    this.closeModal = new HtmlModalPopUp("editor_modal");
    this.saveModal = new HtmlModalPopUp("save_modal");
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
      height = (window.innerHeight - 230) + "px";
    } else {
      height = "100px";
    }
    this.editorCard.nativeElement.style.maxHeight = height;
    this.editorCard.nativeElement.style.height = height;
  }

  openCloseDialog(){
    this.closeModal.updateModal("Close without saving", "Are you sure you want to close this editor? All changes will be discarded.", "Close", "Cancel");
    this.closeModal.openModal();
  }

  openSaveDialog(){
    this.saveModal.updateModal("Close and save", "Are you sure you want to save this configuration?", "Save", "Cancel");
    this.saveModal.openModal();
  }

  closeWithoutSaving(event: any){
    this.closeNoSaveEvent.emit(event);
  }

  closeAndSave() {
    this.closeSaveEvent.emit(this.text);
  }
}
