import { PostValidationClass } from '../../src/app/classes';
import { MockPostValidationInterfaceObject, MockPostValidationInterfaceStringArray } from '../interface-objects';

export const MockPostValidationStringArray: PostValidationClass = new PostValidationClass(MockPostValidationInterfaceStringArray);
export const MockPostValidationObject: PostValidationClass = new PostValidationClass(MockPostValidationInterfaceObject);
