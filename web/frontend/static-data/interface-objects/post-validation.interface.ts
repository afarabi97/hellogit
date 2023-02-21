import { PostValidationInterface } from '../../src/app/interfaces';

export const MockPostValidationInterfaceString: PostValidationInterface = {
  post_validation: 'bad object'
};
export const MockPostValidationInterfaceStringArray: PostValidationInterface = {
  post_validation: [
    'bad object',
    'can not be null'
  ]
};
