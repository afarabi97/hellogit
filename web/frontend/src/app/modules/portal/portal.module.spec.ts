import { PortalModule } from './portal.module';

describe('PortalModule', () => {
  let portal_module: PortalModule;

  beforeEach(() => {
    portal_module = new PortalModule();
  });

  it('should create an instance of PortalModule', () => {
    expect(portal_module).toBeTruthy();
  });
});
