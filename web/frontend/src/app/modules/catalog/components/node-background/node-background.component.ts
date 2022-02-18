import { Component, Input } from '@angular/core';

import { ObjectUtilitiesClass } from '../../../../classes';
import { DEFAULT_NODE_BACKGROUND_SIZE, WHITE } from '../../constants/catalog.constants';
import { SizeInterface } from '../../interfaces';

/**
 * Used for showing different SVG backgrounds based on parent passed inputs
 *
 * @export
 * @class NodeBackgroundComponent
 */
@Component({
  selector: 'cvah-node-background',
  templateUrl: './node-background.component.html',
  styleUrls: [
    './node-background.component.scss'
  ]
})
export class NodeBackgroundComponent {
  // Parent passed variables for html
  @Input() size: SizeInterface;
  @Input() color: string;
  @Input() zoomed: boolean;

  /**
   * Creates an instance of NodeBackgroundComponent.
   *
   * @memberof NodeBackgroundComponent
   */
  constructor() {
    this.size = DEFAULT_NODE_BACKGROUND_SIZE;
    this.zoomed = false;
  }
}
