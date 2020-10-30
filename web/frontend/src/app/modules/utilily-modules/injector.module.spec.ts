import { InjectorModule } from './injector.module';

describe('InjectorModule', () => {
  let injectorModule: InjectorModule;

  beforeEach(() => {
    injectorModule = new InjectorModule(InjectorModule.rootInjector);
  });

  it('should create an instance of InjectorModule', () => {
    expect(injectorModule).toBeTruthy();
  });
});
