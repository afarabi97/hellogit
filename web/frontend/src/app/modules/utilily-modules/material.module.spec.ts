import { MaterialModule } from './material.module';

describe('MaterialModule', () => {
  let materialModule: MaterialModule;

  beforeEach(() => {
    materialModule = new MaterialModule();
  });

  it('should create an instance of MaterialModule', () => {
    expect(materialModule).toBeTruthy();
  });
});
