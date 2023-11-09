import { IPSetFirstLastInterface } from '../interfaces';

/**
 * Class defines the IP Set First Last
 *
 * @export
 * @class IPSetFirstLastClass
 * @implements {IPSetFirstLastInterface}
 */
export class IPSetFirstLastClass implements IPSetFirstLastInterface {
  first: string;
  last: string;

  /**
   * Creates an instance of IPSetFirstLastClass.
   *
   * @param {IPSetFirstLastInterface} ipSetFirstLastInterface
   * @memberof IPSetFirstLastClass
   */
  constructor (ipSetFirstLastInterface: IPSetFirstLastInterface) {
    this.first = ipSetFirstLastInterface.first;
    this.last = ipSetFirstLastInterface.last;
  }
}
