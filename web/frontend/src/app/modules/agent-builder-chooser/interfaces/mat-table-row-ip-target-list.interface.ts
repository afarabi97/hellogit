import { MatTableDataSource } from '@angular/material/table';

import { HostClass, IPTargetListClass } from '../classes';

/**
 * Interface defines the Mat Table Row IP Target List
 *
 * @export
 * @interface MatTableRowIPTargetListInterface
 */
export interface MatTableRowIPTargetListInterface {
  config: IPTargetListClass;
  state: {
    host_list: MatTableDataSource<HostClass>;
    expanded: boolean;
  };
}
