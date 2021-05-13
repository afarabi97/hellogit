import { PmoSupportModule } from './pmo-support.module';

describe('PmoSupportModule', () => {
  let pmo_support_modul: PmoSupportModule;

  beforeEach(() => {
    pmo_support_modul = new PmoSupportModule();
  });

  it('should create an instance of PmoSupportModule', () => {
    expect(pmo_support_modul).toBeTruthy();
  });
});
