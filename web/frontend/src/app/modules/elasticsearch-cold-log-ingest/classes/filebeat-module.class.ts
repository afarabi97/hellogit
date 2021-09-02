import { FileSetInterface } from '../interfaces/file-set.interface';
import { FilebeatModuleInterface } from '../interfaces/filebeat-module.interface';
import { FileSetClass } from './file-set.class';

/**
 * Class defines the Filebeat Module
 *
 * @export
 * @class FilebeatModuleClass
 * @implements {FilebeatModuleInterface}
 */
export class FilebeatModuleClass implements FilebeatModuleInterface {
  value: string;
  name: string;
  filesets: FileSetClass[];

  /**
   * Creates an instance of FilebeatModuleClass.
   *
   * @param {FilebeatModuleInterface} filebeat_module_interface
   * @memberof FilebeatModuleClass
   */
  constructor(filebeat_module_interface: FilebeatModuleInterface) {
    this.value = filebeat_module_interface.value;
    this.name = filebeat_module_interface.name;
    this.filesets = filebeat_module_interface.filesets.map((fs: FileSetInterface) => new FileSetClass(fs));
  }
}
