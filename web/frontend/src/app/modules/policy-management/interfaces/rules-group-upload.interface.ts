import { FormGroup } from "@angular/forms";

/**
 * Interface defines the RulesGroupUpload
 *
 * @export
 * @interface RulesGroupUploadInterface
 */
export interface RulesGroupUploadInterface {
  form_group: FormGroup;
  file_to_upload: File;
}
