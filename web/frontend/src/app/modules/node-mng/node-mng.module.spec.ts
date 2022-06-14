import { NodeMngModule } from './node-mng.module';

describe('NodeMngModule', () => {
  let node_mng_module: NodeMngModule;

  beforeEach(() => {
    node_mng_module = new NodeMngModule();
  });

  it('should create an instance of NodeMngModule', () => {
    expect(node_mng_module).toBeTruthy();
  });
});
