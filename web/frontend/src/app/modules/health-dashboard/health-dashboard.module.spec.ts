import { HealthDashboardModule } from './health-dashboard.module';

describe('HealthDashboardModule', () => {
  let health_dashboard_module: HealthDashboardModule;

  beforeEach(() => {
    health_dashboard_module = new HealthDashboardModule();
  });

  it('should create an instance of HealthDashboardModule', () => {
    expect(health_dashboard_module).toBeTruthy();
  });
});
