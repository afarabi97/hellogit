import { JobClass } from '../../src/app/modules/policy-management/classes';
import { MockJobInterface, MockJobStatusDoneInterface } from '../interface-objects';

export const MockJobClass: JobClass = new JobClass(MockJobInterface);
export const MockJobStatusDoneClass: JobClass = new JobClass(MockJobStatusDoneInterface);
