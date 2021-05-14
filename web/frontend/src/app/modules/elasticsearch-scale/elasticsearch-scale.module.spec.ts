import { ElasticsearchScaleModule } from './elasticsearch-scale.module';

describe('ElasticsearchScaleModule', () => {
  let elasticsearch_scale_module: ElasticsearchScaleModule;

  beforeEach(() => {
    elasticsearch_scale_module = new ElasticsearchScaleModule();
  });

  it('should create an instance of ElasticsearchScaleModule', () => {
    expect(elasticsearch_scale_module).toBeTruthy();
  });
});
