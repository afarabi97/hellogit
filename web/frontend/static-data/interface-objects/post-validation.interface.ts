import { PostValidationInterface } from '../../src/app/interfaces';

export const MockPostValidationInterfaceStringArray: PostValidationInterface = {
  post_validation: [
    'bad object',
    'can not be null'
  ]
};
export const MockPostValidationInterfaceObject: PostValidationInterface = {
  post_validation: {
    first_field: ['invalid_string', 'some_error'],
    second_field: ['invalid_string']
  }
};
