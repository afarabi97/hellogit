import { ElasticsearchNodeDataInterface } from '../../src/app/modules/elasticsearch-scale/interfaces';

export const MockElasticsearchNodeDataInterface: ElasticsearchNodeDataInterface = {
  coordinating: 1,
  data: 6,
  master: 3,
  max_scale_count_coordinating: 6,
  max_scale_count_data: 6,
  max_scale_count_master: 6,
  max_scale_count_ml: 6,
  ml: 1,
  server_node_count: 2
};
