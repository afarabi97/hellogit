import { Component, OnInit, Input } from '@angular/core';


declare var $: any;

@Component({
  selector: 'app-modal-loading',
  templateUrl: './modal-loading.component.html',
  styleUrls: ['./modal-loading.component.css']
})
export class ModalLoadingComponent implements OnInit {

  @Input()
  modalId: string;

  @Input()
  title: string;
  
  constructor() { }

  ngOnInit() {
  }

  openModal() {
    $("#" + this.modalId).modal({backdrop: 'static', keyboard: false});
  }

  hideModal() {
    $("#" + this.modalId).modal('hide');
  }

}
