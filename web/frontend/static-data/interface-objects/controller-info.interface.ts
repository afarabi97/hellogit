import { ControllerInfoInterface } from '../../src/app/interfaces';

export const MockControllerInfoInterface: ControllerInfoInterface = {
  ip_address: '10.40.31.64',
  gateway: '10.40.31.1',
  netmask: '255.255.255.0',
  name: 'br0',
  cidrs: [
    '10.40.31.32',
    '10.40.31.96',
    '10.40.31.128',
    '10.40.31.160',
    '10.40.31.192'
  ],
  dhcp_range: '10.40.31.224',
  cidr_ranges: {
    '10.40.31.0': {
      first: '10.40.31.0',
      last: '10.40.31.31'
    },
    '10.40.31.32': {
      first: '10.40.31.32',
      last: '10.40.31.63'
    },
    '10.40.31.64': {
      first: '10.40.31.64',
      last: '10.40.31.95'
    },
    '10.40.31.96': {
      first: '10.40.31.96',
      last: '10.40.31.127'
    },
    '10.40.31.128': {
      first: '10.40.31.128',
      last: '10.40.31.159'
    },
    '10.40.31.160': {
      first: '10.40.31.160',
      last: '10.40.31.191'
    },
    '10.40.31.192': {
      first: '10.40.31.192',
      last: '10.40.31.223'
    },
    '10.40.31.224': {
      first: '10.40.31.224',
      last: '10.40.31.255'
    }
  }
};
