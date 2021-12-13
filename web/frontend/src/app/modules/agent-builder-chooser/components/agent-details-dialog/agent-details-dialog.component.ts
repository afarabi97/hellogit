import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppConfigClass, ElementSpecClass } from '../../classes';
import { AgentDetailsDialogDataInterface } from '../../interfaces';

/**
 * Component used as dialog window to view windows agent details
 *
 * @export
 * @class AgentDetailsDialogComponent
 */
@Component({
  selector: 'cvah-agent-details-dialog',
  templateUrl: 'agent-details-dialog.component.html',
  styleUrls: ['./agent-details-dialog.component.scss']
})
export class AgentDetailsDialogComponent {

  /**
   * Creates an instance of AgentDetailsDialogComponent.
   *
   * @param {MatDialogRef<AgentDetailsDialogComponent>} mat_dialog_ref_
   * @param {AgentDetailsDialogDataInterface} mat_dialog_data
   * @memberof AgentDetailsDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<AgentDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: AgentDetailsDialogDataInterface) { }

  /**
   * Used for getting element config data
   *
   * @param {AppConfigClass} app_config
   * @param {ElementSpecClass} element_spec
   * @returns
   * @memberof AgentDetailsDialogComponent
   */
  get_element_config(app_config: AppConfigClass, element_spec: ElementSpecClass): any {
    return this.mat_dialog_data.agent_installer_configuration.customPackages[app_config.name][element_spec.name];
  }

  /**
   * Used for closing the dialog window
   *
   * @memberof AgentDetailsDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }
}
