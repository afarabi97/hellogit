import { ToolsModule } from './tools.module';

describe('ToolsModule', () => {
  let tools_module: ToolsModule;

  beforeEach(() => {
    tools_module = new ToolsModule();
  });

  it('should create an instance of ToolsModule', () => {
    expect(tools_module).toBeTruthy();
  });
});
