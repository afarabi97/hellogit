import { ConfigValidatorsInterface } from '../interfaces/config-validators.interface';

export const PORTAL_TITLE: string = 'Portal';
export const TARGET_CONFIG_VALIDATORS: ConfigValidatorsInterface = {
  required: [
    {
      error_message: 'Required field',
      validatorFn: 'required'
    }
  ],
  url: [
    {
      error_message: 'Required field',
      validatorFn: 'required'
    },
    {
      error_message: "Link must start with either 'http://' or 'https://' without quotation marks.",
      validatorFn: 'pattern',
      ops: {
        pattern: /^(http:[/][/])|(https:[/][/])/
      }
    }
  ]
};
