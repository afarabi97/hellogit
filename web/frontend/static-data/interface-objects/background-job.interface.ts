import { BackgroundJobInterface } from '../../src/app/interfaces';

export const MockBackgroundJobInterface: BackgroundJobInterface = {
  job_id: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  redis_key: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  created_at: '2020-10-06T16:36:17.566553Z',
  enqueued_at: '2020-10-06T16:36:17.566640Z',
  started_at: '2020-10-06T16:36:19.278810Z',
  ended_at: '2020-10-06T16:36:19.282604Z',
  origin: 'default',
  description: 'app.service.kickstart_service.perform_kickstart',
  timeout: 180,
  status: 'queued',
  ttl: 'Returns ttl for a job that determines how long a job will be persisted. In the future, this method will also be responsible for determining ttl for repeated jobs.',
  result_ttl: 500,
  queued_position: 1,
  meta: 'new meta',
  worker_name: 'Donald Trump'
};
export const MockBackgroundJobInterfaceStarted: BackgroundJobInterface = {
  job_id: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  redis_key: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  created_at: '2020-10-06T16:36:17.566553Z',
  enqueued_at: '2020-10-06T16:36:17.566640Z',
  started_at: '2020-10-06T16:36:19.278810Z',
  ended_at: '2020-10-06T16:36:19.282604Z',
  origin: 'default',
  description: 'app.service.kickstart_service.perform_kickstart',
  timeout: 180,
  status: 'started',
  ttl: 'Returns ttl for a job that determines how long a job will be persisted. In the future, this method will also be responsible for determining ttl for repeated jobs.',
  result_ttl: 500,
  queued_position: 1,
  meta: 'new meta',
  worker_name: 'Donald Trump'
};
export const MockBackgroundJobInterfaceFailed: BackgroundJobInterface = {
  job_id: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  redis_key: 'fbbd7123-4926-4a84-a8ea-7c926e38edab',
  created_at: '2020-10-06T16:36:17.566553Z',
  enqueued_at: '2020-10-06T16:36:17.566640Z',
  started_at: '2020-10-06T16:36:19.278810Z',
  ended_at: '2020-10-06T16:36:19.282604Z',
  origin: 'default',
  description: 'app.service.kickstart_service.perform_kickstart',
  timeout: 180,
  status: 'failed',
  ttl: 'Returns ttl for a job that determines how long a job will be persisted. In the future, this method will also be responsible for determining ttl for repeated jobs.',
  result_ttl: 500,
  queued_position: 1,
  meta: 'new meta',
  worker_name: 'Donald Trump'
};
