import { MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

import { MatSnackbarConfigurationClass } from '../../classes';

/**
 * Interface defines the mat snackbar service
 *
 * @export
 * @interface MatSnackbarServiceInterface
 */
export interface MatSnackbarServiceInterface {
  displaySnackBar(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void;
  destroySnackBar(): void;
}
