import { MatSnackbarConfigurationClass } from '../../classes';

/**
 * Interface defines the mat snackbar service
 *
 * @export
 * @interface MatSnackbarServiceInterface
 */
export interface MatSnackbarServiceInterface {
  generate_return_success_snackbar_message(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void;
  generate_return_fail_snackbar_message(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void;
  generate_return_error_snackbar_message(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void;
  displaySnackBar(message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void;
  destroySnackBar(): void;
}
