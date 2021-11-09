import { ElementSpecInterface } from './element-spec.interface';

/**
 * Interface defines the App Config
 *
 * @export
 * @interface AppConfigInterface
 */
export interface AppConfigInterface {
  name: string;
  form?: ElementSpecInterface[];
}
