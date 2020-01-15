import { Component, OnInit, Input, ViewChild,
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import { ConfirmActionPopup } from '../classes/ConfirmActionPopup';
import { ConfigmapsService } from '../configmaps/configmaps.service';

@Component({
  selector: 'app-configmap-editor',
  templateUrl: './configmap-editor.component.html',
  styleUrls: ['./configmap-editor.component.css']
})
export class ConfigmapEditorComponent implements OnInit {

  @ViewChild('editorCard', {static: false})
  private editorCard: ElementRef;

  @ViewChild('outerCard', {static: false})
  private outerCard: ElementRef;

  @Input()
  public title: string;

  @Input()
  public text: string;

  @Input()
  public configMapName: string;

  @Output()
  closeNoSaveEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  closeSaveEvent: EventEmitter<any> = new EventEmitter();

  numbers: Array<number>;

  private associatedPods: Array<{podName:string, namespace: string}>;

  constructor( private confirmer: ConfirmActionPopup, private configMapSrv: ConfigmapsService) {
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
    if (this.configMapName === null || this.configMapName === ""){
      this.configMapName = "doesNotExist";
    }

    this.configMapSrv.getAssociatedPods(this.configMapName).subscribe(data => {
      this.associatedPods = data as Array<{podName:string, namespace: string}>;
      let confirmText = 'Are you sure you want to save this configuration? Doing so will cause ';

      for (let index = 0; index < this.associatedPods.length; index++){
        let podName = this.associatedPods[index].podName;
        confirmText = confirmText.concat(podName);
        if (index !== (this.associatedPods.length - 1)){
          confirmText = confirmText.concat(", ")
        }
      }

      confirmText = confirmText.concat(' to bounce on your Kubernetes cluster which will bring certain services down for a couple of minutes.');

      this.confirmer.confirmAction(
        "Close and save",
        confirmText,
        "Save",
        "Saved configuration file " + this.title,
        "Could not save.",
        () => { this.closeAndSave() }
      );
    });
  }

  closeWithoutSaving(event: any){
    this.closeNoSaveEvent.emit(event);
  }

  closeAndSave() {
    this.closeSaveEvent.emit({configData: this.text, associatedPods: this.associatedPods});
  }
}
