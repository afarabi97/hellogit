import { TextEditorConfigurationInterface } from '../../src/app/interfaces';
import {
    CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_FALSE_INTERFACE,
    CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_TRUE_INTERFACE,
    CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_FALSE_INTERFACE,
    CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_TRUE_INTERFACE
} from './confirm-action-configuration.interface';


export const TEXT_EDITOR_CONFIGURATION_ALT_ACTION_FUNC_TRUE_INTERFACE: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false,
  confirm_save: CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_TRUE_INTERFACE,
  confirm_close: CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_TRUE_INTERFACE
};
export const TEXT_EDITOR_CONFIGURATION_ALT_ACTION_FUNC_FALSE_INTERFACE: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false,
  confirm_save: CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_FALSE_INTERFACE,
  confirm_close: CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_FALSE_INTERFACE
};
export const TEXT_EDITOR_CONFIGURATION_NO_CONFIRM_ACTIONS_INTERFACE: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false
};
