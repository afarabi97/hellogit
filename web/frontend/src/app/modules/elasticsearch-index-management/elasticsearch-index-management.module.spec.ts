import { ElasticsearchIndexManagementModule } from './elasticsearch-index-management.module';

describe('ElasticsearchIndexManagementModule', () => {
  let elasticsearch_index_management_module: ElasticsearchIndexManagementModule;

  beforeEach(() => {
    elasticsearch_index_management_module = new ElasticsearchIndexManagementModule();
  });

  it('should create an instance of ElasticsearchIndexManagementModule', () => {
    expect(elasticsearch_index_management_module).toBeTruthy();
  });
});
