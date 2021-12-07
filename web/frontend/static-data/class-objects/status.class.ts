import { StatusClass } from '../../src/app/classes';
import { StatusInterface } from '../../src/app/interfaces';
import { MockStatusInterfaceArkimeViewer } from '../interface-objects';

export const MockStatusClass_LogstashDeployed: StatusClass = {
  appVersion: "4.0.3",
  application: "logstash",
  deployment_name: "philpot-sensor3-logstash",
  hostname: "philpot-sensor3.philpot",
  node_type: "Sensor",
  status: "DEPLOYED"
};
export const MockStatusClass_LogstashDeployedError: StatusClass = {
  appVersion: "4.0.3",
  application: "logstash",
  deployment_name: "philpot-sensor3-logstash",
  hostname: "philpot-sensor3.philpot",
  node_type: "Sensor",
  status: ""
};
export const MockStatusClassArkimeViewer: StatusClass[] = MockStatusInterfaceArkimeViewer.map((s: StatusInterface) => new StatusClass(s));
