import { Injector, NgModule } from '@angular/core';

@NgModule({
})
export class InjectorModule {
  private static rootInjector_: Injector;

  static get rootInjector() {
    return InjectorModule.rootInjector_;
  }

  constructor(private injector: Injector) {
    InjectorModule.rootInjector_ = injector;
  }

}
