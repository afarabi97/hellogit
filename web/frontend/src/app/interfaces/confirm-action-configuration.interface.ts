/**
 * Interface defines the ConfirmActionConfiguration
 *
 * @export
 * @interface ConfirmActionConfigurationInterface
 */
export interface ConfirmActionConfigurationInterface {
  title: string;
  message: string;
  confirmButtonText: string;
  successText: string;
  failText: string;
  actionFunc: () => void;
  useGeneralActionFunc?: boolean;
}
