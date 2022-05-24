import { FormGroup } from '@angular/forms';
import { RepoSettingsSnapshotInterface } from '../interfaces/repo-settings-snapshot.interface';
import { ObjectUtilitiesClass } from 'src/app/classes';

export class RepoSettingsSnapshotClass implements RepoSettingsSnapshotInterface {
  ip_address: string;
  protocol: string;
  bucket: string;
  username: string;
  password: string;
  port: Number;

  constructor(iface: any) {
    this.ip_address = iface.ip_address;
    this.protocol = iface.protocol;
    this.bucket = iface.bucket;
    this.username = iface.username;
    this.password = iface.password;
    this.port = iface.port;
  }
}
