import { async, TestBed } from '@angular/core/testing';

import { AppModule } from './app.module';
import * as AppModuleFunctions from './app.module';
import { TestingModule } from './modules/testing-modules/testing.module';
import { AppLoadService } from './services/app-load.service';
import { AppLoadServiceSpy } from './services/app-load.service.spec';

describe('AppModule', () => {
  let appModule: AppModule;
  let spyInitializeApp: jasmine.Spy<any>;
  let spyInitializeSystemName: jasmine.Spy<any>;
  let serviceAppLoad: AppLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        TestingModule
      ],
      providers: [
        { provide: AppLoadService, useClass: AppLoadServiceSpy },
      ]
    });
    appModule = new AppModule();
    serviceAppLoad = TestBed.get(AppLoadService);
  });

  it('should create an instance of AppModule', () => {
    expect(appModule).toBeTruthy();
  });

  describe('functions', () => {
    describe('initializeApp', () => {
      it('should call initializeApp', async(() => {
        spyInitializeApp = spyOn(AppModuleFunctions, 'initializeApp').and.callThrough();

        AppModuleFunctions.initializeApp(serviceAppLoad);

        expect(AppModuleFunctions.initializeApp).toHaveBeenCalled();
      }));
    });

    describe('initializeSystemName', () => {
      it('should call initializeSystemName', async(() => {
        spyInitializeSystemName = spyOn(AppModuleFunctions, 'initializeSystemName').and.callThrough();

        AppModuleFunctions.initializeSystemName(serviceAppLoad);

        expect(AppModuleFunctions.initializeSystemName).toHaveBeenCalled();
      }));
    });
  });
});
