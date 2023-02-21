import { ElasticsearchObjectClass } from '../../src/app/modules/health-dashboard/classes';
import { ElasticsearchObjectInterface } from '../../src/app/modules/health-dashboard/interfaces';
import { MockElasticseachObjectWriteRejectsInterfaceArray } from '../interface-objects';

export const MockElasticseachObjectWriteRejectsClassArray: ElasticsearchObjectClass[] = MockElasticseachObjectWriteRejectsInterfaceArray.map((eo: ElasticsearchObjectInterface) => new ElasticsearchObjectClass(eo));
