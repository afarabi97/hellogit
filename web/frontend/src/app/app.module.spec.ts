import { fakeAsync, TestBed } from '@angular/core/testing';

import { AppModule } from './app.module';
import * as AppModuleFunctions from './app.module';
import { TestingModule } from './modules/testing-modules/testing.module';
import { AppLoadService } from './services/app-load.service';
import { AppLoadServiceSpy } from './services/app-load.service.spec';

describe('AppModule', () => {
  let appModule: AppModule;
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
    serviceAppLoad = TestBed.inject(AppLoadService);
  });

  it('should create an instance of AppModule', () => {
    expect(appModule).toBeTruthy();
  });

  describe('functions', () => {
    describe('initializeApp', () => {
      it('should call initializeApp', fakeAsync(() => {
        const value = AppModuleFunctions.initializeApp(serviceAppLoad);

        expect(value).toBeDefined();
      }));
    });
  });
});
