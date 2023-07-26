import { ValidationErrorInterface } from '../../src/app/interfaces';

export const MockValidationErrorInterface: ValidationErrorInterface = {
  status: 'error',
  messages: {
    deployment_type: ['Missing data for required field.', 'Some other error'],
    ip_address: ['Missing data for required field.']
  }
};
