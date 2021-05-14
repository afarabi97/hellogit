import { ElasticsearchCheckClass } from '../../src/app/modules/elasticsearch-scale/classes';
import {
    MockStatusNoneElasticsearchCheckInterface,
    MockStatusPendingElasticsearchCheckInterface,
    MockStatusReadyElasticsearchCheckInterface,
    MockStatusUnknownElasticsearchCheckInterface
} from '../interface-objects-v3_7';

export const MockStatusReadyElasticsearchCheckClass: ElasticsearchCheckClass = new ElasticsearchCheckClass(MockStatusReadyElasticsearchCheckInterface);
export const MockStatusUnknownElasticsearchCheckClass: ElasticsearchCheckClass = new ElasticsearchCheckClass(MockStatusUnknownElasticsearchCheckInterface);
export const MockStatusNoneElasticsearchCheckClass: ElasticsearchCheckClass = new ElasticsearchCheckClass(MockStatusNoneElasticsearchCheckInterface);
export const MockStatusPendingElasticsearchCheckClass: ElasticsearchCheckClass = new ElasticsearchCheckClass(MockStatusPendingElasticsearchCheckInterface);
