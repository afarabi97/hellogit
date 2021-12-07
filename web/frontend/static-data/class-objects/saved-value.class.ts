import { SavedValueClass } from '../../src/app/classes';
import { SavedValueInterface } from '../../src/app/interfaces';
import { MockSavedValueInterfaceArkime } from '../interface-objects';

export const MockSavedValueClassArkime: SavedValueClass[] = MockSavedValueInterfaceArkime.map((sv: SavedValueInterface) => new SavedValueClass(sv));
