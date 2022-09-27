import { AlertListClass } from '../../src/app/modules/security-alerts/classes';
import {
  MockAlertListInterfaceEndgame,
  MockAlertListInterfaceSignal,
  MockAlertListInterfaceSuricata,
  MockAlertListInterfaceZeek
} from '../interface-objects';

export const MockAlertListClassZeek: AlertListClass = new AlertListClass(MockAlertListInterfaceZeek);
export const MockAlertListClassSuricata: AlertListClass = new AlertListClass(MockAlertListInterfaceSuricata);
export const MockAlertListClassSignal: AlertListClass = new AlertListClass(MockAlertListInterfaceSignal);
export const MockAlertListClassEndgame: AlertListClass = new AlertListClass(MockAlertListInterfaceEndgame);
