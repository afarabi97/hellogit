import { Component, OnInit, Input, ViewChild,
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { ConfirmActionPopup } from '../classes/ConfirmActionPopup';
import { ConfigmapsService } from '../configmaps/configmaps.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-elasticconfig-editor',
  templateUrl: './elasticconfig-editor.component.html',
  styleUrls: ['./elasticconfig-editor.component.css']
})
export class ElasticEditorComponent implements OnInit {

  @ViewChild('editorCard', {static: false})
  private editorCard: ElementRef;

  @ViewChild('outerCard', {static: false})
  private outerCard: ElementRef;

  @Input()
  public text: string;

  @Output()
  closeNoSaveEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  closeSaveEvent: EventEmitter<any> = new EventEmitter();

  numbers: Array<number>;
  controllerMaintainer: boolean;

  constructor( private confirmer: ConfirmActionPopup, private configMapSrv: ConfigmapsService, private userService: UserService) {
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

  ngOnInit() {
  }

  ngAfterViewInit() {
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
    let confirmText = 'Are you sure you want to save this configuration? Doing so will update the Elasticsearch configuration and may cause interuption to services for a few minutes.';

    this.confirmer.confirmAction(
      "Close and save",
      confirmText,
      "Save",
      "Saved Elastic Config",
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
