import { RepoSettingsSnapshotInterface } from '../../src/app/modules/tools/interfaces/repo-settings-snapshot.interface';

export const MockRepoSettingsSnapshotInterface: RepoSettingsSnapshotInterface = {
  access_key: 'username',
  bucket: 's3-bucket',
  endpoint: '10.10.10.10',
  protocol: 'http',
  secret_key: 'password'
};
