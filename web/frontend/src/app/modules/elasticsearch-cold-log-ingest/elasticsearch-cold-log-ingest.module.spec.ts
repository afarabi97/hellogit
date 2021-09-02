import { ElasticsearchColdLogIngestModule } from './elasticsearch-cold-log-ingest.module';

describe('ElasticsearchColdLogIngestModule', () => {
  let elasticsearch_cold_log_ingest_module: ElasticsearchColdLogIngestModule;

  beforeEach(() => {
    elasticsearch_cold_log_ingest_module = new ElasticsearchColdLogIngestModule();
  });

  it('should create an instance of ElasticsearchColdLogIngestModule', () => {
    expect(elasticsearch_cold_log_ingest_module).toBeTruthy();
  });
});
