import { RepoSettingsSnapshotInterface } from '../../src/app/modules/tools/interfaces/repo-settings-snapshot.interface';

export const MockRepoSettingsSnapshotInterface: RepoSettingsSnapshotInterface = {
  username: 'username',
  bucket: 's3-bucket',
  ip_address: '10.10.10.10',
  protocol: 'http',
  password: 'password',
  port: 9000
};
