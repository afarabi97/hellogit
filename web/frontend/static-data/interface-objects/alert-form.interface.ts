import { AlertFormInterface } from '../../src/app/modules/security-alerts/interfaces';

export const MockAlertFormInterfaceDays: AlertFormInterface = {
  acknowledged: false,
  escalated: false,
  showClosed: false,
  timeInterval: 'days',
  timeAmount: 24,
  performEscalation: false,
  hiveForm: {
    event_title: 'test',
    event_tags: 'test tag',
    event_severity: 'low',
    event_description: 'hive test'
  },
  startDatetime: new Date("10-11-2022 18:45:03"),
  endDatetime: new Date("10-11-2022 18:50:03")
};
export const MockAlertFormInterfaceMinutesLess60: AlertFormInterface = {
  acknowledged: false,
  escalated: false,
  showClosed: false,
  timeInterval: 'minutes',
  timeAmount: 24,
  performEscalation: false,
  hiveForm: {
    event_title: 'test',
    event_tags: 'test tag',
    event_severity: 'low',
    event_description: 'hive test'
  },
  startDatetime: new Date("10-11-2022 18:45:03"),
  endDatetime: new Date("10-11-2022 18:50:03")
};
export const MockAlertFormInterfaceMinutesGreater60: AlertFormInterface = {
  acknowledged: false,
  escalated: false,
  showClosed: false,
  timeInterval: 'minutes',
  timeAmount: 61,
  performEscalation: false,
  hiveForm: {
    event_title: 'test',
    event_tags: 'test tag',
    event_severity: 'low',
    event_description: 'hive test'
  },
  startDatetime: new Date("10-11-2022 18:45:03"),
  endDatetime: new Date("10-11-2022 18:50:03")
};
