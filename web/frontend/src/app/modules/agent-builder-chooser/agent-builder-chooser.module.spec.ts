import { AgentBuilderChooserModule } from './agent-builder-chooser.module';

describe('AgentBuilderChooserModule', () => {
  let agent_builder_chooser_module: AgentBuilderChooserModule;

  beforeEach(() => {
    agent_builder_chooser_module = new AgentBuilderChooserModule();
  });

  it('should create an instance of AgentBuilderChooserModule', () => {
    expect(agent_builder_chooser_module).toBeTruthy();
  });
});
