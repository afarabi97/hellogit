import { JobLogClass } from '../../src/app/modules/server-stdout/classes';
import { MockJobLogInterface } from '../interface-objects';

export const MockJobLogClass: JobLogClass = new JobLogClass(MockJobLogInterface);
