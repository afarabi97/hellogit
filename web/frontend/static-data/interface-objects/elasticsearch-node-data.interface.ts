import { ElasticsearchNodeDataInterface } from '../../src/app/modules/elasticsearch-scale/interfaces';

export const MockElasticsearchNodeDataInterface: ElasticsearchNodeDataInterface = {
  data: 6,
  master: 3,
  max_scale_count_data: 6,
  max_scale_count_master: 6,
  max_scale_count_ml: 6,
  max_scale_count_ingest: 6,
  ml: 1,
  server_node_count: 2,
  ingest: 4
};
