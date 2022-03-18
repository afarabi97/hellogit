import { SavedValueClass } from '../../src/app/classes';
import { SavedValueInterface } from '../../src/app/interfaces';
import {
  MockSavedValueInterfaceArkime,
  MockSavedValueInterfaceArkimeViewer,
  MockSavedValueInterfaceSuricata,
  MockSavedValueInterfaceSuricata2
} from '../interface-objects';

export const MockSavedValueClassArkime: SavedValueClass[] = MockSavedValueInterfaceArkime.map((sv: SavedValueInterface) => new SavedValueClass(sv));
export const MockSavedValueClassArkimeViewer: SavedValueClass[] = MockSavedValueInterfaceArkimeViewer.map((sv: SavedValueInterface) => new SavedValueClass(sv));
export const MockSavedValueClassSuricata: SavedValueClass[] = MockSavedValueInterfaceSuricata.map((sv: SavedValueInterface) => new SavedValueClass(sv));
export const MockSavedValueClassSuricata2: SavedValueClass[] = MockSavedValueInterfaceSuricata2.map((sv: SavedValueInterface) => new SavedValueClass(sv));
