import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NodeClass } from '../../../../classes';

/**
 * Component used for displaying node related info
 *
 * @export
 * @class NodeInfoDialogComponent
 */
@Component({
  selector: 'cvah-node-info-dialog',
  templateUrl: 'node-info-dialog.component.html',
  styleUrls: ['node-info-dialog.component.scss']
})
export class NodeInfoDialogComponent {

  /**
   * Creates an instance of NodeInfoDialogComponent.
   *
   * @param {MatDialogRef<NodeInfoDialogComponent>} mat_dialog_ref_
   * @param {NodeClass} node
   * @memberof NodeInfoDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<NodeInfoDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public node: NodeClass) { }

  /**
   * Used for closing dialog window
   *
   * @memberof NodeInfoDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }
}
