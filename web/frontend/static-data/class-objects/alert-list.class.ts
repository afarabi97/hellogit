import { AlertListClass } from '../../src/app/modules/security-alerts/classes';
import { MockAlertListInterfaceZeek, MockAlertListInterfaceSuricata } from '../interface-objects';

export const MockAlertListClassZeek: AlertListClass = new AlertListClass(MockAlertListInterfaceZeek);
export const MockAlertListClassSuricata: AlertListClass = new AlertListClass(MockAlertListInterfaceSuricata);
