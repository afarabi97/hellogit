import { ValidatorObjectInterface } from '../../../interfaces';

/**
 * Interface defines the config validators
 *
 * @export
 * @interface ConfigValidatorsInterface
 */
export interface ConfigValidatorsInterface {
  required: ValidatorObjectInterface[];
  url: ValidatorObjectInterface[];
}
