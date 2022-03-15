import { PCAPClass } from '../../src/app/classes';
import {
  MockPCAPInterfaceFlawedArmyTraffic,
  MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPInterfacePasswordProtectedDocInfectionTraffic
} from '../interface-objects';

export const MockPCAPClassInfectionTrafficFromPasswordProtectedWordDoc: PCAPClass = new PCAPClass(MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc);
export const MockPCAPClassFlawedArmyTraffic: PCAPClass = new PCAPClass(MockPCAPInterfaceFlawedArmyTraffic);
export const MockPCAPClassPasswordProtectedDocInfectionTraffic: PCAPClass = new PCAPClass(MockPCAPInterfacePasswordProtectedDocInfectionTraffic);
export const MockPCAPClassArray: PCAPClass[] = [
  MockPCAPClassInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPClassFlawedArmyTraffic,
  MockPCAPClassPasswordProtectedDocInfectionTraffic
];
