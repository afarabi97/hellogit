import { JobClass } from '../../src/app/modules/policy-management/classes';

export const MockJobClass: JobClass = {
  job_id: '1',
  redis_key: 'test',
  created_at: '2020-02-27 00:08:58',
  enqueued_at: '2020-02-27 00:08:58',
  started_at: '2020-02-27 00:08:58',
  ended_at: '2020-02-27 00:08:58',
  origin: 'test',
  description: 'perform_rulesync',
  timeout: 0,
  status: 'finished',
  ttl: '100',
  result_ttl: 100,
  queued_position: 1
};

export const MockJobStatusDoneClass: JobClass = {
  job_id: '1',
  redis_key: 'test_done',
  created_at: '2020-02-27 00:08:58',
  enqueued_at: '2020-02-27 00:08:58',
  started_at: '2020-02-27 00:08:58',
  ended_at: '2020-02-27 00:08:58',
  origin: 'test_done',
  description: 'perform_rulesync',
  timeout: 0,
  status: 'done',
  ttl: '100',
  result_ttl: 100,
  queued_position: 1
};
