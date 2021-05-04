import { ConfirmActionConfigurationInterface } from './confirm-action-configuration.interface';
/**
 * Interface defines the TextEditorConfiguration
 *
 * @export
 * @interface TextEditorConfigurationInterface
 */
export interface TextEditorConfigurationInterface {
  show_options: boolean;
  is_read_only: boolean;
  text: string;
  use_language: string;
  title?: string;
  disable_save?: boolean;
  confirm_save?: ConfirmActionConfigurationInterface;
  confirm_close?: ConfirmActionConfigurationInterface;
}
