import { PCAPInterface } from '../../src/app/interfaces';

export const MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc: PCAPInterface = {
  "name": "2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap",
  "size": 7639515,
  "created_date": "2022-03-15 02:40:36",
  "first_packet_date": "2021-09-30 07:06:40",
  "last_packet_date": "2021-10-30 07:38:20",
  "sha256": "89687b5d606ba818f0a100e92c9e48641aacfcb32c2c122c5d3002cfa1802cb7"
};
export const MockPCAPInterfaceFlawedAmmyyTraffic: PCAPInterface = {
  "name": "2019-03-06-Flawed-Ammyy-traffic.pcap",
  "size": 4610405,
  "created_date": "2022-03-15 02:40:37",
  "first_packet_date": "2021-09-30 07:06:40",
  "last_packet_date": "2021-10-30 07:38:20",
  "sha256": "19ce2fb46685b832cda2225e0599c4492dfb2ffb48eba7848f8300b15a8e15e3"
};
export const MockPCAPInterfacePasswordProtectedDocInfectionTraffic: PCAPInterface = {
  "name": "2019-05-01-password-protected-doc-infection-traffic.pcap",
  "size": 6992374,
  "created_date": "2022-03-15 02:40:37",
  "first_packet_date": "2021-09-30 07:06:40",
  "last_packet_date": "2021-10-30 07:38:20",
  "sha256": "d2f4cc20ff022366938755b15a230eb2d8ec43c3cab8dfdb78356c4eb13126e7"
};
export const MockPCAPInterfaceArray: PCAPInterface[] = [
  MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPInterfaceFlawedAmmyyTraffic,
  MockPCAPInterfacePasswordProtectedDocInfectionTraffic
];
