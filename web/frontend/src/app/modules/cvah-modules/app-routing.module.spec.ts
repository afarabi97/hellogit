import {AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
  let appRoutingModule: AppRoutingModule;

  beforeEach(() => {
    appRoutingModule = new AppRoutingModule();
  });

  it('should create an instance of AppRoutingModule', () => {
    expect(appRoutingModule).toBeTruthy();
  });
});
