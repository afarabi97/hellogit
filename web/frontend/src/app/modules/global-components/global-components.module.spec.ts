import { GlobalComponentsModule } from './global-components.module';

describe('GlobalComponentsModule', () => {
  let global_components_module: GlobalComponentsModule;

  beforeEach(() => {
    global_components_module = new GlobalComponentsModule();
  });

  it('should create an instance of GlobalComponentsModule', () => {
    expect(global_components_module).toBeTruthy();
  });
});
