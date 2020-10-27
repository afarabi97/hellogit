import { UserInterface } from '../../src/app/interfaces';

export const MockUserAllTrueInterface: UserInterface = {
  uid: '1',
  givenName: 'Donald J. Trump',
  surname: 'Trump',
  displayName: 'Donald Trump',
  email: 'donald.trump@whitehouse.gov',
  memberOf: [],
  clientRoles: [],
  roles: [],
  controller_admin: true,
  controller_maintainer: true,
  operator: true,
  realm_admin: true
};

export const MockUserAllFalseInterface: UserInterface = {
  uid: '1',
  givenName: 'Donald J. Trump',
  surname: 'Trump',
  displayName: 'Donald Trump',
  email: 'donald.trump@whitehouse.gov',
  memberOf: [],
  clientRoles: [],
  roles: [],
  controller_admin: false,
  controller_maintainer: false,
  operator: false,
  realm_admin: false
};
