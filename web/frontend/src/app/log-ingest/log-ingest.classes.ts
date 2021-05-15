export class FileSet {
  value: string;
  name: string;
  tooltip: string;

  constructor(data){
    this.value = data.value
    this.name = data.name
    this.tooltip = data.tooltip
  }
}

export class FilebeatModule {
  value: string;
  name: string;
  filesets: Array<FileSet>;

  constructor(data){
    this.value = data.value
    this.name = data.name
    this.filesets = [];
    for (let i of data.filesets){
      this.filesets.push(new FileSet(i))
    }
  }
}
