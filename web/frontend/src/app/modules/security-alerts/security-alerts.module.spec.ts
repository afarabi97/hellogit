import { SecurityAlertsModule } from './security-alerts.module';

describe('SecurityAlertsModule', () => {
  let security_alerts_module: SecurityAlertsModule;

  beforeEach(() => {
    security_alerts_module = new SecurityAlertsModule();
  });

  it('should create an instance of SecurityAlertsModule', () => {
    expect(security_alerts_module).toBeTruthy();
  });
});
