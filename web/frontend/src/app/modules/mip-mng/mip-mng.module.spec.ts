import { MipMngModule } from './mip-mng.module';

describe('MipMngModule', () => {
  let mip_mng_module: MipMngModule;

  beforeEach(() => {
    mip_mng_module = new MipMngModule();
  });

  it('should create an instance of MipMngModule', () => {
    expect(mip_mng_module).toBeTruthy();
  });
});
