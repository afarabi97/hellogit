import { HitInterface } from '../interfaces';
import { HitSourceClass } from './hit-source.class';

/**
 * Class defines the Hit
 *
 * @export
 * @class HitClass
 * @implements {HitInterface}
 */
export class HitClass implements HitInterface {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: HitSourceClass;

  /**
   * Creates an instance of HitClass.
   *
   * @param {HitInterface} hit_interface
   * @memberof HitClass
   */
  constructor(hit_interface: HitInterface) {
    this._index = hit_interface._index;
    this._type = hit_interface._type;
    this._id = hit_interface._id;
    this._score = hit_interface._score;
    this._source = new HitSourceClass(hit_interface._source);
  }
}
