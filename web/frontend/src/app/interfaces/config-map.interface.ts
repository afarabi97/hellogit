import { ConfigMapMetadataInterface } from './config-map-metadata.interface';
import { KeyStringValueStringPairInterface } from './key-string-value-string-pair.interface';

/**
 * Interface defines the Config Map
 *
 * @export
 * @interface ConfigMapInterface
 */
export interface ConfigMapInterface {
  data: KeyStringValueStringPairInterface;
  metadata: ConfigMapMetadataInterface;
  kind?: string;
  api_version?: string;
  binary_data?: string;
}
