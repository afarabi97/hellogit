import { NotificationInterface } from '../../src/app/interfaces';

export const MockNotificationInterface_NotInArray: NotificationInterface = {
  action: "Installing",
  application: "Zeek",
  data: {
    0: {
      application: "zeek",
      appVersion: "4.0.3",
      deployment_name: "philpot-sensor3-zeek",
      hostname: "philpot-sensor3.philpot",
      node_type: "Sensor",
      status: "PENDING INSTALL"
    }
  },
  exception: "",
  message: "Installing Zeek on philpot-sensor3.philpot",
  role: "catalog",
  status: "IN_PROGRESS",
  timestamp: "2021-10-20T00:37:18.054880",
  _id: "616f64be02375abfe9724034"
};
export const MockNotificationInterface_ZeekPendingInstall: NotificationInterface = {
  action: "Installing",
  application: "Zeek",
  data: {
    0: {
      application: "zeek",
      appVersion: "4.0.3",
      deployment_name: "philpot-sensor3-zeek",
      hostname: "philpot-sensor3.philpot",
      node_type: "Sensor",
      status: "PENDING INSTALL"
    }
  },
  exception: "",
  message: "Installing Zeek on philpot-sensor3.philpot",
  role: "catalog",
  status: "IN_PROGRESS",
  timestamp: "2021-10-20T00:37:18.054880",
  _id: "616f64be0d915abfe9724024"
};
export const MockNotificationInterface_ZeekDeployed: NotificationInterface = {
  action: "Installing",
  application: "Zeek",
  data: {
    0: {
      appVersion: "4.0.3",
      application: "zeek",
      deployment_name: "philpot-sensor3-zeek",
      hostname: "philpot-sensor3.philpot",
      node_type: "Sensor",
      status: "DEPLOYED"
    }
  },
  exception: "",
  message: "",
  role: "catalog",
  status: "DEPLOYED",
  timestamp: "2021-10-20T00:37:24.032513",
  _id: "616f64c40d915ac15cff817d"
};
export const MockNotificationInterface_ZeekInstallComplete: NotificationInterface = {
  action: "Installing",
  application: "Zeek",
  data: {
    0: {
      appVersion: "4.0.3",
      application: "zeek",
      deployment_name: "philpot-sensor3-zeek",
      hostname: "philpot-sensor3.philpot",
      node_type: "Sensor",
      status: "DEPLOYED"
    }
  },
  exception: "",
  message: "Install completed.",
  role: "catalog",
  status: "COMPLETED",
  timestamp: "2021-10-20T00:37:24.521931",
  _id: "616f64c40d915abfe9724025"
};
export const MockNotificationInterfaceArray: NotificationInterface[] = [
  MockNotificationInterface_ZeekPendingInstall,
  MockNotificationInterface_ZeekDeployed,
  MockNotificationInterface_ZeekInstallComplete
];
