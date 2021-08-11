import { ConfigMapMetadataInterface, KeyStringValueStringPairInterface, OwnerReferenceInterface } from '../interfaces';
import { ObjectUtilitiesClass } from './object-utilities.class';
import { OwnerReferenceClass } from './owner-reference.class';

/**
 * Class defines the Config Map Metadata
 *
 * @export
 * @class ConfigMapMetadataClass
 * @implements {ConfigMapMetadataInterface}
 */
export class ConfigMapMetadataClass implements ConfigMapMetadataInterface {
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
  owner_references?: OwnerReferenceClass[];
  self_link?: string;

  /**
   * Creates an instance of ConfigMapMetadataClass.
   *
   * @param {ConfigMapMetadataInterface} config_map_Metadata_interface
   * @memberof ConfigMapMetadataClass
   */
  constructor(config_map_Metadata_interface: ConfigMapMetadataInterface) {
    this.name = config_map_Metadata_interface.name;
    this.namespace = config_map_Metadata_interface.namespace;
    this.creation_timestamp = config_map_Metadata_interface.creation_timestamp;
    this.uid = config_map_Metadata_interface.uid;
    this.resource_version = config_map_Metadata_interface.resource_version;
    this.annotations = config_map_Metadata_interface.annotations;
    this.cluster_name = config_map_Metadata_interface.cluster_name;
    this.deletion_grace_period_seconds = config_map_Metadata_interface.deletion_grace_period_seconds;
    this.deletion_timestamp = config_map_Metadata_interface.deletion_timestamp;
    this.finalizers = config_map_Metadata_interface.finalizers;
    this.generate_name = config_map_Metadata_interface.generate_name;
    this.generation = config_map_Metadata_interface.generation;
    this.initializers = config_map_Metadata_interface.initializers;
    this.labels = config_map_Metadata_interface.labels;
    this.self_link = config_map_Metadata_interface.self_link;
    if (ObjectUtilitiesClass.notUndefNull(config_map_Metadata_interface.owner_references)) {
      this.owner_references = config_map_Metadata_interface.owner_references.map((or: OwnerReferenceInterface) => new OwnerReferenceClass(or));
    } else {
      this.owner_references = null;
    }
  }
}
