import { Injector, NgModule } from '@angular/core';

/**
 * Module used for getting inections for abstract service
 *
 * @export
 * @class InjectorModule
 */
@NgModule({})
export class InjectorModule {
  // Used for injecting into other services
  private static rootInjector_: Injector;

  /**
   * Creates an instance of InjectorModule.
   *
   * @param {Injector} injector
   * @memberof InjectorModule
   */
  constructor(injector: Injector) {
    InjectorModule.rootInjector_ = injector;
  }

  /**
   * Used for getting the rootinjector so that other services can inject
   *
   * @readonly
   * @static
   * @type {Injector}
   * @memberof InjectorModule
   */
  static get rootInjector(): Injector {
    return InjectorModule.rootInjector_;
  }
}
