import { KitSettingsClass, NodeClass } from '../../../classes';

/**
 * Interface defines the Add Node Mat Dialog Data
 *
 * @export
 * @interface AddNodeMatDialogDataInterface
 */
export interface AddNodeMatDialogDataInterface {
  kit_settings: KitSettingsClass;
  nodes: NodeClass[];
  setup_nodes: NodeClass[];
}
