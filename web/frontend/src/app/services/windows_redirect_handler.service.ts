import { Injectable } from '@angular/core';

import { WindowsRedirectHandlerServiceInterface } from '../interfaces';

/**
 * Used for performing windows related operations
 *
 * @export
 * @class WindowsRedirectHandlerService
 * @implements {WindowsRedirectHandlerServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class WindowsRedirectHandlerService implements WindowsRedirectHandlerServiceInterface {

  /**
   * Used for opening a new tab with provided url
   *
   * @param {string} url
   * @memberof WindowsRedirectHandlerService
   */
  open_in_new_tab(url: string): void {
    const win: Window = window.open(url, '_blank');
    win.focus();
  }
}
