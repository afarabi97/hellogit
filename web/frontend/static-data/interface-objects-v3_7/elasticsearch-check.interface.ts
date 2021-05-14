import { ElasticsearchCheckInterface } from '../../src/app/modules/elasticsearch-scale/interfaces';

export const MockStatusReadyElasticsearchCheckInterface: ElasticsearchCheckInterface = {
  status: 'Ready'
};
export const MockStatusUnknownElasticsearchCheckInterface: ElasticsearchCheckInterface = {
  status: 'Unknown'
};
export const MockStatusNoneElasticsearchCheckInterface: ElasticsearchCheckInterface = {
  status: 'None'
};
export const MockStatusPendingElasticsearchCheckInterface: ElasticsearchCheckInterface = {
  status: 'Pending'
};
