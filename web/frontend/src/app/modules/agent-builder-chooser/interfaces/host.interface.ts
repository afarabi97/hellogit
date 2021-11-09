/**
 * Interface defines the Host
 *
 * @export
 * @interface HostInterface
 */
export interface HostInterface {
  hostname: string;
  state: string;
  last_state_change: string;
  target_config_id: string;
}
