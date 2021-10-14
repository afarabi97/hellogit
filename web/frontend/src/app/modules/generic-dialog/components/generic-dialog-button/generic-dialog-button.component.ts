import { Component, Input } from '@angular/core';

/**
 * Component used for passing generic button for use with generic dialog component
 *
 * @export
 * @class GenericButtonComponent
 */
@Component({
  selector: 'cvah-generic-dialog-button',
  templateUrl: './generic-dialog-button.component.html',
  styleUrls: [
    'generic-dialog-button.component.scss'
  ]
})
export class GenericButtonComponent {
  // Used for setting button color
  @Input() color: string = 'default';
  // Used for setting button disabled
  @Input() disabled: boolean = false;
}
