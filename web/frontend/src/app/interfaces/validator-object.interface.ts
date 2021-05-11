/**
 * Interface defines the validator object
 *
 * @export
 * @interface ValidatorObjectInterface
 */
export interface ValidatorObjectInterface {
  validatorFn: string;
  error_message: string | any;
  ops?: any;
};
