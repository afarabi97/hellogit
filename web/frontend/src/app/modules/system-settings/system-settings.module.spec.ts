import { SystemSettingsModule } from './system-settings.module';

describe('SystemSettingsModule', () => {
  let system_settings_module: SystemSettingsModule;

  beforeEach(() => {
    system_settings_module = new SystemSettingsModule();
  });

  it('should create an instance of SystemSettingsModule', () => {
    expect(system_settings_module).toBeTruthy();
  });
});
