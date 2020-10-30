import { Injectable } from '@angular/core';

import { CookieServiceInterface } from '../interfaces';

/**
 * Service used to set and get document cookies
 *
 * @export
 * @class CookieService
 * @implements {CookieServiceInterface}
 */
@Injectable()
export class CookieService implements CookieServiceInterface {

  /**
   * Used for setting a document cookie
   *
   * @param {string} key
   * @param {string} value
   * @memberof CookieService
   */
  set(key: string, value: string): void {
    const cookieValue = `${key}=${value}`;
    document.cookie = cookieValue;
  }

  /**
   * Used to get document cookie
   *
   * @param {string} key
   * @returns {string}
   * @memberof CookieService
   */
  get(key: string): string {
    const decodedCookie: string = decodeURIComponent(document.cookie);
    const pairs: string[] = decodedCookie.split(/;\s*/);
    const prefix = `${key}=`;
    let returnValue = '';

    pairs.forEach((pair: string) => {
      if (pair.indexOf(prefix) === 0) {
        returnValue = pair.substring(prefix.length);
      }
    });

    return returnValue;
  }
}
