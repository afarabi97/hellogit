import { MatDialogRef } from '@angular/material/dialog';

import { GenericDialogComponent } from '../modules/generic-dialog/generic-dialog.component';

export type GenericDialogRef<T> = MatDialogRef<GenericDialogComponent<T>>;
