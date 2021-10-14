import { NotificationsModule } from './notifications.module';

describe('NotificationsModule', () => {
  let notifications_module: NotificationsModule;

  beforeEach(() => {
    notifications_module = new NotificationsModule();
  });

  it('should create an instance of NotificationsModule', () => {
    expect(notifications_module).toBeTruthy();
  });
});
