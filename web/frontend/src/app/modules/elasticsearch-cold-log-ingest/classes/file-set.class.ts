import { FileSetInterface } from '../interfaces/file-set.interface';

/**
 * Class defines the File Set
 *
 * @export
 * @class FileSetClass
 * @implements {FileSetInterface}
 */
export class FileSetClass implements FileSetInterface {
  value: string;
  name: string;
  tooltip: string;

  /**
   * Creates an instance of FileSetClass.
   *
   * @param {FileSetInterface} file_set_interface
   * @memberof FileSetClass
   */
  constructor(file_set_interface: FileSetInterface) {
    this.value = file_set_interface.value;
    this.name = file_set_interface.name;
    this.tooltip = file_set_interface.tooltip;
  }
}
