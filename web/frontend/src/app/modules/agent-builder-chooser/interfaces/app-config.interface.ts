import { ElementSpecInterface } from './element-spec.interface';

/**
 * Interface defines the App Config
 *
 * @export
 * @interface AppConfigInterface
 */
export interface AppConfigInterface {
  name: string;
  hasEditableConfig?: boolean;
  configLocation?: string;
  form?: ElementSpecInterface[];
}

export interface AppConfigContentInterface {
  filename: string;
  content: string;
}
