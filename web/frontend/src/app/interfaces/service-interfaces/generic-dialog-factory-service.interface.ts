import { MatDialogConfig } from '@angular/material/dialog';

import { DialogDataInterface } from '../../interfaces/dialog-data.interface';
import { GenericDialogService } from '../../services/helpers/generic-dialog.service';

/**
 * Interface defines the generic dialog factory service
 *
 * @export
 * @interface GenericDialogFactoryServiceInterface
 * @template T
 */
export interface GenericDialogFactoryServiceInterface<T> {
  open(dialog_data: DialogDataInterface<T>, mat_dialog_config: MatDialogConfig): GenericDialogService<T>;
}
