import { PCAPClass } from '../../src/app/classes';
import {
  MockPCAPInterfaceFlawedAmmyyTraffic,
  MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPInterfacePasswordProtectedDocInfectionTraffic
} from '../interface-objects';

export const MockPCAPClassInfectionTrafficFromPasswordProtectedWordDoc: PCAPClass = new PCAPClass(MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc);
export const MockPCAPClassFlawedAmmyyTraffic: PCAPClass = new PCAPClass(MockPCAPInterfaceFlawedAmmyyTraffic);
export const MockPCAPClassPasswordProtectedDocInfectionTraffic: PCAPClass = new PCAPClass(MockPCAPInterfacePasswordProtectedDocInfectionTraffic);
export const MockPCAPClassArray: PCAPClass[] = [
  MockPCAPClassInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPClassFlawedAmmyyTraffic,
  MockPCAPClassPasswordProtectedDocInfectionTraffic
];
