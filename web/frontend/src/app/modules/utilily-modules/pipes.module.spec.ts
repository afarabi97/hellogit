import { PipesModule } from './pipes.module';

describe('PipesModule', () => {
  let pipes_module: PipesModule;

  beforeEach(() => {
    pipes_module = new PipesModule();
  });

  it('should create an instance of PipesModule', () => {
    expect(pipes_module).toBeTruthy();
  });
});
