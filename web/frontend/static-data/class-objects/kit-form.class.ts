import { KitFormClass, KitStatusClass } from '../../src/app/classes';
import { MockNodeServerClass, MockNodeSensorClass  } from './node.class';

export const MockKitFormClass: KitFormClass = {
    complete: true,
    kubernetes_services_cidr: '10.40.13.96',
    nodes: [ MockNodeServerClass, MockNodeSensorClass]
};

export const MockKitStatusClass: KitStatusClass = {
  control_plane_deployed: true,
  general_settings_configured: true,
  kit_settings_configured: true,
  esxi_settings_configured: true,
  ready_to_deploy: true,
  base_kit_deployed: true,
  jobs_running: false,
  deploy_kit_running: false
};
