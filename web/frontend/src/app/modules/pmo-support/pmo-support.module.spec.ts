import { PmoSupportModule } from './pmo-support.module';

describe('PmoSupportModule', () => {
  let pmo_support_module: PmoSupportModule;

  beforeEach(() => {
    pmo_support_module = new PmoSupportModule();
  });

  it('should create an instance of PmoSupportModule', () => {
    expect(pmo_support_module).toBeTruthy();
  });
});
