import {Component, Inject, Input, Output} from '@angular/core';

/**
 * Simple component to show different SVG backgrounds based on `class`, `color`,
 * and `size`.
 */
@Component({
  selector: 'node-background',
  templateUrl: './node-background.component.html',
  styleUrls: ['./node-background.component.scss']
})
export class NodeBackgroundComponent {
  @Input() class: string;
  @Input() color: string;
  @Input() size: any;
  @Input() zoomed: boolean = false;
}
