/**
 * Interface defines the upgrade controller
 *
 * @export
 * @interface UpgradeControllerInterface
 */
export interface UpgradeControllerInterface {
  original_controller_ip: string;
  new_controller_ip: string;
  username: string;
  password: string;
  upgrade_path: string;
}
