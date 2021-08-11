import { ConfigMapInterface, KeyStringValueStringPairInterface } from '../interfaces';
import { ConfigMapMetadataClass } from './config-map-metadata.class';

/**
 * Class defines the Config Map
 *
 * @export
 * @class ConfigMapClass
 * @implements {ConfigMapInterface}
 */
export class ConfigMapClass implements ConfigMapInterface {
  data: KeyStringValueStringPairInterface;
  metadata: ConfigMapMetadataClass;
  kind?: string;
  api_version?: string;
  binary_data?: string;

  /**
   * Creates an instance of ConfigMapClass.
   *
   * @param {ConfigMapInterface} config_map_interface
   * @memberof ConfigMapClass
   */
  constructor(config_map_interface: ConfigMapInterface) {
    this.data = config_map_interface.data;
    this.metadata = new ConfigMapMetadataClass(config_map_interface.metadata);
    this.kind = config_map_interface.kind;
    this.api_version = config_map_interface.api_version;
    this.binary_data = config_map_interface.binary_data;
  }
}
