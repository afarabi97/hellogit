import { KeyValueClass } from '../../src/app/classes';
import { KeyValueInterface } from '../../src/app/interfaces';
import { MockKeyValueInterfaceArray } from '../interface-objects';

export const MockKeyValueClassArray: KeyValueClass[] = MockKeyValueInterfaceArray.map((kv: KeyValueInterface) => new KeyValueClass(kv));
