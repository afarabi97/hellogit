/**
 * Interface defines status
 *
 * @export
 * @class StatusInterface
 */
export class StatusInterface {
  appVersion: string;
  application: string;
  deployment_name: string;
  hostname: string;
  node_type?: string;
  status: string;
}
