import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { kickStartTooltips } from '../../kickstart/kickstart-form';
import { PXE_TYPES } from '../../../frontend-constants';

@Component({
  selector: 'app-kickstart-node-form',
  templateUrl: './kickstart-node-form.component.html',
  styleUrls: ['./kickstart-node-form.component.css']
})
export class KickstartNodeFormComponent implements OnInit {

  @Input()
  node: FormGroup;

  @Input()
  availableIPs: string[] = [];

  pxe_types: string[] = PXE_TYPES;

  constructor() { }

  ngOnInit() {
  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}
