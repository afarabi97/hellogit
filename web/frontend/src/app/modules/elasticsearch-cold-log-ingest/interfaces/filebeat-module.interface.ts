import { FileSetInterface } from './file-set.interface';

/**
 * Interface defines the Filebeat Module
 *
 * @export
 * @interface FilebeatModuleInterface
 */
export interface FilebeatModuleInterface {
  value: string;
  name: string;
  filesets: FileSetInterface[];
}
