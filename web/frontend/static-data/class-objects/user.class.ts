import { UserClass } from '../../src/app/classes';
import { MockUserAllFalseInterface, MockUserAllTrueInterface } from '../interface-objects';

export const MockUserAllTrueClass: UserClass = new UserClass(MockUserAllTrueInterface);
export const MockUserAllFalseClass: UserClass = new UserClass(MockUserAllFalseInterface);
