import { KeyStringValueStringPairInterface } from './key-string-value-string-pair.interface';
import { OwnerReferenceInterface } from './owner-reference.interface';

/**
 * Interface defines the Config Map Metadata
 *
 * @export
 * @interface ConfigMapMetadataInterface
 */
export interface ConfigMapMetadataInterface {
  name: string;
  namespace: string;
  creation_timestamp: string;
  uid: string;
  resource_version: string;
  annotations?: KeyStringValueStringPairInterface;
  cluster_name?: string;
  deletion_grace_period_seconds?: string;
  deletion_timestamp?: string;
  finalizers?: string;
  generate_name?: string;
  generation?: string;
  initializers?: string;
  labels?: KeyStringValueStringPairInterface;
  owner_references?: OwnerReferenceInterface[];
  self_link?: string;
}
