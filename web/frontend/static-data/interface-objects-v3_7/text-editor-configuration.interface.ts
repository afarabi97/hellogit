import { TextEditorConfigurationInterface } from '../../src/app/interfaces';
import {
    ConfirmActionConfigurationCloseAltActionFunctionFalseInterface,
    ConfirmActionConfigurationCloseAltActionFunctionTrueInterface,
    ConfirmActionConfigurationSaveAltActionFunctionFalseInterface,
    ConfirmActionConfigurationSaveAltActionFunctionTrueInterface
} from './confirm-action-configuration.interface';


export const TextEditorConfigurationAltActionFuncTrueInterface: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false,
  confirm_save: ConfirmActionConfigurationSaveAltActionFunctionTrueInterface,
  confirm_close: ConfirmActionConfigurationCloseAltActionFunctionTrueInterface
};
export const TextEditorConfigurationAltActionFuncFalseInterface: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false,
  confirm_save: ConfirmActionConfigurationSaveAltActionFunctionFalseInterface,
  confirm_close: ConfirmActionConfigurationCloseAltActionFunctionFalseInterface
};
export const TextEditorConfigurationNoConfirmActionsInterface: TextEditorConfigurationInterface = {
  show_options: true,
  is_read_only: false,
  title: 'Fake Title',
  text: 'Fake Code String',
  use_language: 'yaml',
  disable_save: false
};
