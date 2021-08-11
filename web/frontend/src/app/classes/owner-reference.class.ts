import { OwnerReferenceInterface } from '../interfaces';

/**
 * Class defines the Owner Reference
 *
 * @export
 * @class OwnerReferenceClass
 * @implements {OwnerReferenceInterface}
 */
export class OwnerReferenceClass implements OwnerReferenceInterface {
  api_version: string;
  block_owner_deletion: boolean;
  controller: boolean;
  kind: string;
  name: string;
  uid: string;

  /**
   * Creates an instance of OwnerReferenceClass.
   *
   * @param {OwnerReferenceInterface} owner_reference_interface
   * @memberof OwnerReferenceClass
   */
  constructor(owner_reference_interface: OwnerReferenceInterface) {
    this.api_version = owner_reference_interface.api_version;
    this.block_owner_deletion = owner_reference_interface.block_owner_deletion;
    this.controller = owner_reference_interface.controller;
    this.kind = owner_reference_interface.kind;
    this.name = owner_reference_interface.name;
    this.uid = owner_reference_interface.uid;
  }
}
