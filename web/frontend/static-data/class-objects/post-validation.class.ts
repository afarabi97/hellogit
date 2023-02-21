import { PostValidationClass } from '../../src/app/classes';
import { MockPostValidationInterfaceString, MockPostValidationInterfaceStringArray } from '../interface-objects';

export const MockPostValidationString: PostValidationClass = new PostValidationClass(MockPostValidationInterfaceString);
export const MockPostValidationStringArray: PostValidationClass = new PostValidationClass(MockPostValidationInterfaceStringArray);
