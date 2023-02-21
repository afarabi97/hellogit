import { ElasticsearchObjectInterface } from '../../src/app/modules/health-dashboard/interfaces';

export const MockElasticseachObjectWriteRejectsInterfaceArray: ElasticsearchObjectInterface[] = [
  {
      node_name: "tfplenum-es-ml-0",
      name: "analyze",
      active: "0",
      queue: "0",
      rejected: "0"
  },
  {
      node_name: "tfplenum-es-ml-0",
      name: "auto_complete",
      active: "0",
      queue: "0",
      rejected: "0"
  }
];
