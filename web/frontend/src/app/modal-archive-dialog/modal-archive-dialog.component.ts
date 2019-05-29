import { Component, OnInit, Input, Output, 
          EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HtmlModalRestoreArchiveDialog } from '../html-elements';
import { ArchiveService } from '../archive.service';


@Component({
  selector: 'app-modal-archive-dialog',
  templateUrl: './modal-archive-dialog.component.html',
  styleUrls: ['./modal-archive-dialog.component.css']
})
export class ModalArchiveDialogComponent implements OnInit {

  @ViewChild('selections')
  selections: ElementRef;

  @Input()
  modal: HtmlModalRestoreArchiveDialog;

  @Input()
  config_id: string;

  @Output()
  primaryButtonClick: EventEmitter<any> = new EventEmitter();
  constructor(private archiveSrv: ArchiveService) {}

  ngOnInit() { }

  onRadioSelect(event: any){
    this.modal.isDisabled = false;    
  }

  toggleVisibility(index: number){
    this.modal.selection[index]['isVisible'] = !this.modal.selection[index]['isVisible'];    
  }

  triggerPrimaryClickEvent(){
    for (let item of this.selections['nativeElement']['children']){
      let input = item['children'][0].children[0];
      if (input.checked){
        this.primaryButtonClick.emit(input.value);
      }
    }
  }

  cancelDeleteArchive(index: number){
    this.modal.selection[index]["confirmArchiveDeletion"] = false;
  }

  deleteArchiveConfirm(index: number) {
    this.modal.selection[index]["confirmArchiveDeletion"] = true;
  }

  deleteArchive(index: number){
    let archive_id = this.modal.selection[index]["_id"];
    this.archiveSrv.deleteArchive(this.config_id, archive_id).subscribe(data => {
      if (parseInt(data as string) === 1){
        this.modal.selection.splice(index, 1);
      } else {
        console.warn("Failed to delete archive for an unknown reason.");
      }
    });
  }

}
