import { PCAPInterface } from '../../src/app/interfaces';

export const MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc: PCAPInterface = {
  "name": "2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap",
  "size": 7639515,
  "createdDate": "2022-03-15 02:40:36",
  "hashes": {
    "md5": "8226f1dda88c29cf3ef191357a59d47f",
    "sha1": "074e232ddcb6a2a5795ea7ee09784f8265030438",
    "sha256": "89687b5d606ba818f0a100e92c9e48641aacfcb32c2c122c5d3002cfa1802cb7"
  }
};
export const MockPCAPInterfaceFlawedAmmyyTraffic: PCAPInterface = {
  "name": "2019-03-06-Flawed-Ammyy-traffic.pcap",
  "size": 4610405, "createdDate":
  "2022-03-15 02:40:37",
  "hashes": {
    "md5": "4b9f943d8f2e14282e17c4b1410131ea",
    "sha1": "f3ca111182d8a3b46cd4a87699e6e3dbc6806af6",
    "sha256": "19ce2fb46685b832cda2225e0599c4492dfb2ffb48eba7848f8300b15a8e15e3"
  }
};
export const MockPCAPInterfacePasswordProtectedDocInfectionTraffic: PCAPInterface = {
  "name": "2019-05-01-password-protected-doc-infection-traffic.pcap",
  "size": 6992374,
  "createdDate": "2022-03-15 02:40:37",
  "hashes": {
    "md5": "317875a8221d0c9080ed9637d6d58278",
    "sha1": "8ca143dd2c14d0359672bffee8056b4c85a47955",
    "sha256": "d2f4cc20ff022366938755b15a230eb2d8ec43c3cab8dfdb78356c4eb13126e7"
  }
};
export const MockPCAPInterfaceArray: PCAPInterface[] = [
  MockPCAPInterfaceInfectionTrafficFromPasswordProtectedWordDoc,
  MockPCAPInterfaceFlawedAmmyyTraffic,
  MockPCAPInterfacePasswordProtectedDocInfectionTraffic
];
