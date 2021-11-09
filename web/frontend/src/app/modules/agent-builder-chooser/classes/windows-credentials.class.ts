import { WindowsCredentialsInterface } from '../interfaces';

/**
 * Class defines the windows credentials
 *
 * @export
 * @class WindowsCredentialsClass
 * @implements {WindowsCredentialsInterface}
 */
export class WindowsCredentialsClass implements WindowsCredentialsInterface {
  user_name: string;
  password: string;

  /**
   * Creates an instance of WindowsCredentialsClass.
   *
   * @param {WindowsCredentialsInterface} windows_credentials_interface
   * @memberof WindowsCredentialsClass
   */
  constructor(windows_credentials_interface: WindowsCredentialsInterface) {
    this.user_name = windows_credentials_interface.user_name;
    this.password = windows_credentials_interface.password;
  }
}
