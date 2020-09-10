export abstract class ObjectUtilsClass {

  static notUndefNull(data: any): boolean {
    return (typeof data !== 'undefined') && (data !== null);
  }
}
