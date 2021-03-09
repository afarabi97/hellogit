import { PolicyManagementModule } from './policy-management.module';

describe('PolicyManagementModule', () => {
  let policy_management_module: PolicyManagementModule;

  beforeEach(() => {
    policy_management_module = new PolicyManagementModule();
  });

  it('should create an instance of PolicyManagementModule', () => {
    expect(policy_management_module).toBeTruthy();
  });
});
