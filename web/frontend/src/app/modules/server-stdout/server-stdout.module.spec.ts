import { ServerStdoutModule } from './server-stdout.module';

describe('ServerStdoutModule', () => {
  let server_stdout_module: ServerStdoutModule;

  beforeEach(() => {
    server_stdout_module = new ServerStdoutModule();
  });

  it('should create an instance of ServerStdoutModule', () => {
    expect(server_stdout_module).toBeTruthy();
  });
});
