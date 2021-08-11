/**
 * Interface defines the Owner Reference
 *
 * @export
 * @interface OwnerReferenceInterface
 */
export interface OwnerReferenceInterface {
  api_version: string;
  block_owner_deletion: boolean;
  controller: boolean;
  kind: string;
  name: string;
  uid: string;
}
