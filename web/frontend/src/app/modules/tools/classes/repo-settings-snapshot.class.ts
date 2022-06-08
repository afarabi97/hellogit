import { RepoSettingsSnapshotInterface } from '../interfaces/repo-settings-snapshot.interface';

/**
 * Class defines the Repo Settings Snapshot
 *
 * @export
 * @class RepoSettingsSnapshotClass
 * @implements {RepoSettingsSnapshotInterface}
 */
export class RepoSettingsSnapshotClass implements RepoSettingsSnapshotInterface {
  ip_address: string;
  protocol: string;
  bucket: string;
  username: string;
  password: string;
  port: Number;

  /**
   * Creates an instance of RepoSettingsSnapshotClass.
   *
   * @param {RepoSettingsSnapshotInterface} repo_settings_snapshot_interface
   * @memberof RepoSettingsSnapshotClass
   */
  constructor(repo_settings_snapshot_interface: RepoSettingsSnapshotInterface) {
    this.ip_address = repo_settings_snapshot_interface.ip_address;
    this.protocol = repo_settings_snapshot_interface.protocol;
    this.bucket = repo_settings_snapshot_interface.bucket;
    this.username = repo_settings_snapshot_interface.username;
    this.password = repo_settings_snapshot_interface.password;
    this.port = repo_settings_snapshot_interface.port;
  }
}
