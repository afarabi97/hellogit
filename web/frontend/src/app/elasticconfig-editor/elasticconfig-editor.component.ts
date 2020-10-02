import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

import { ConfirmActionPopup } from '../classes/ConfirmActionPopup';
import { UserService } from '../user.service';

@Component({
  selector: 'app-elasticconfig-editor',
  templateUrl: './elasticconfig-editor.component.html'
})
export class ElasticEditorComponent implements AfterViewInit {
  @Input() text: string;
  @Output() closeNoSaveEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeSaveEvent: EventEmitter<string> = new EventEmitter<string>();
  numbers: number[];
  controllerMaintainer: boolean;
  @ViewChild('editorCard', {static: false}) private editorCard: ElementRef;
  @ViewChild('outerCard', {static: false}) private outerCard: ElementRef;

  constructor(private confirmer: ConfirmActionPopup,
              private userService: UserService) {
    this.numbers = new Array(500).fill(true);
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  /**
   * Triggers when the browser window resizes.
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event){
     this.resizeEditor();
  }

  ngAfterViewInit() {
    this.resizeEditor();
  }

  private resizeEditor(){
    const height = `${window.innerHeight > 400 ? window.innerHeight - 130 : '100'}px`;
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
      () => this.closeWithoutSaving('')
    );
  }

  openSaveDialog(){
    const confirmText = 'Are you sure you want to save this configuration? ' +
                        'Doing so will update the Elasticsearch configuration ' +
                        'and may cause interuption to services for a few minutes.';

    this.confirmer.confirmAction(
      "Close and save",
      confirmText,
      "Save",
      "Saved Elastic Config",
      "Could not save.",
      () => this.closeAndSave()
    );
  }

  closeWithoutSaving(event: string){
    this.closeNoSaveEvent.emit(event);
  }

  closeAndSave() {
    this.closeSaveEvent.emit(this.text);
  }
}
