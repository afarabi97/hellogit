import { FormGroup } from "@angular/forms";

/**
 * Interface defines the backing object
 *
 * @export
 * @interface BackingObjectInterface
 */
export interface BackingObjectInterface {
  title: string;
  instructions: string;
  dialogForm: FormGroup;
  confirmBtnText: string;
}
