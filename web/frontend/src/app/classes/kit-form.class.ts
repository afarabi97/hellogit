import { KitFormInterface, NodeInterface } from '../interfaces';
import { NodeClass } from './node.class';
import { ObjectUtilitiesClass } from './object-utilities.class';

/**
 * Class defines the kit form
 *
 * @export
 * @class KitFormClass
 */
export class KitFormClass implements KitFormInterface {
  complete: boolean;
  kubernetes_services_cidr: string;
  nodes: NodeClass[];

  /**
   * Creates an instance of KitFormClass.
   *
   * @param {KitFormInterface} kitFormInterface
   * @memberof KitFormClass
   */
  constructor(kitFormInterface: KitFormInterface) {
    this.complete = kitFormInterface.complete;
    this.kubernetes_services_cidr = kitFormInterface.kubernetes_services_cidr;
    if (ObjectUtilitiesClass.notUndefNull(kitFormInterface.nodes)) {
      this.nodes = kitFormInterface.nodes.map((n: NodeInterface) => new NodeClass(n));
    } else {
      this.nodes = [];
    }
  }
}

export interface KitStatusInterface {
  base_kit_deployed: boolean;
  control_plane_deployed: boolean;
  esxi_settings_configured: boolean;
  jobs_running: boolean;
  kit_settings_configured: boolean;
  general_settings_configured: boolean;
  ready_to_deploy: boolean;
  deploy_kit_running: boolean;
}

/**
 * Class defines the kit form
 *
 * @export
 * @class KitFormClass
 */
export class KitStatusClass implements KitStatusInterface {

  base_kit_deployed: boolean;
  control_plane_deployed: boolean;
  esxi_settings_configured: boolean;
  jobs_running: boolean;
  kit_settings_configured: boolean;
  general_settings_configured: boolean;
  ready_to_deploy: boolean;
  deploy_kit_running: boolean;

  /**
   * Creates an instance of KitFormClass.
   *
   * @param {KitFormInterface} kitFormInterface
   * @memberof KitFormClass
   */
  constructor(iface: KitStatusInterface) {
    this.base_kit_deployed = iface.base_kit_deployed;
    this.control_plane_deployed = iface.control_plane_deployed;
    this.esxi_settings_configured = iface.esxi_settings_configured;
    this.jobs_running = iface.jobs_running;
    this.kit_settings_configured = iface.kit_settings_configured;
    this.general_settings_configured = iface.general_settings_configured;
    this.ready_to_deploy = iface.ready_to_deploy;
    this.deploy_kit_running = iface.deploy_kit_running;
  }
}
