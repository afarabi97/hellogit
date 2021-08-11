import { ConfigMapModule } from './config-map.module';

describe('ConfigMapModule', () => {
  let config_map_module: ConfigMapModule;

  beforeEach(() => {
    config_map_module = new ConfigMapModule();
  });

  it('should create an instance of ConfigMapModule', () => {
    expect(config_map_module).toBeTruthy();
  });
});
