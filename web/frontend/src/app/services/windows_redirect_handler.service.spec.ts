import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WindowsRedirectHandlerServiceInterface } from '../interfaces';
import { WindowsRedirectHandlerService } from './windows_redirect_handler.service';

describe('WindowsRedirectHandlerService', () => {
  let service: WindowsRedirectHandlerService;

  // Spy's
  let spyOpenInNewTab: jasmine.Spy<any>;

  // Test Data
  const message = 'Test Message';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        WindowsRedirectHandlerService
      ]
    });

    service = TestBed.inject(WindowsRedirectHandlerService);

    spyOpenInNewTab = spyOn(service, 'open_in_new_tab').and.callThrough();
  });

  const reset = () => {
    spyOpenInNewTab.calls.reset();
  };

  it('should create WindowsRedirectHandlerService', () => {
    expect(service).toBeTruthy();
  });

  describe('WindowsRedirectHandlerService methods', () => {
    describe('open_in_new_tab()', () => {
      it('should call open_in_new_tab()', () => {
        reset();

        service.open_in_new_tab('');

        expect(service.open_in_new_tab).toHaveBeenCalled();
      });
    });
  });
});

@Injectable()
export class WindowsRedirectHandlerServiceSpy implements WindowsRedirectHandlerServiceInterface {

  open_in_new_tab = jasmine.createSpy('open_in_new_tab').and.callFake(
    (url: string): void => {}
  );
}
