import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MockSnackBarConfigurationActionClass } from '../../../static-data/class-objects';
import { MatSnackbarConfigurationClass } from '../classes';
import { MatSnackbarServiceInterface } from '../interfaces';
import { MatSnackBarService } from './mat-snackbar.service';

describe('MatSnackBarService', () => {
  let service: MatSnackBarService;

  // Spy's
  let spyGenerateReturnSuccessSnackbarMessage: jasmine.Spy<any>;
  let spyGenerateReturnFailSnackbarMessage: jasmine.Spy<any>;
  let spyGenerateReturnErrorSnackbarMessage: jasmine.Spy<any>;
  let spyDisplaySnackBar: jasmine.Spy<any>;
  let spyDestroySnackBar: jasmine.Spy<any>;

  // Test Data
  const message = 'Test Message';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        MatSnackBarService
      ]
    });

    service = TestBed.inject(MatSnackBarService);

    spyGenerateReturnSuccessSnackbarMessage = spyOn(service, 'generate_return_success_snackbar_message').and.callThrough();
    spyGenerateReturnFailSnackbarMessage = spyOn(service, 'generate_return_fail_snackbar_message').and.callThrough();
    spyGenerateReturnErrorSnackbarMessage = spyOn(service, 'generate_return_error_snackbar_message').and.callThrough();
    spyDisplaySnackBar = spyOn(service, 'displaySnackBar').and.callThrough();
    spyDestroySnackBar = spyOn(service, 'destroySnackBar').and.callThrough();
  });

  const reset = () => {
    spyGenerateReturnSuccessSnackbarMessage.calls.reset();
    spyGenerateReturnFailSnackbarMessage.calls.reset();
    spyGenerateReturnErrorSnackbarMessage.calls.reset();
    spyDisplaySnackBar.calls.reset();
    spyDestroySnackBar.calls.reset();
  };

  afterAll(() => {
    service.ngOnDestroy();
  });

  it('should create SnackbarService', () => {
    expect(service).toBeTruthy();
  });

  describe('MatSnackBarService methods', () => {
    describe('generate_return_success_snackbar_message()', () => {
      it('should call generate_return_success_snackbar_message()', () => {
        reset();

        service.generate_return_success_snackbar_message(message);

        expect(service.generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call generate_return_success_snackbar_message() and call diaplaySnackBar()', () => {
        reset();

        service.generate_return_success_snackbar_message(message, { actionLabel: 'Close' });

        expect(service.displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('generate_return_fail_snackbar_message()', () => {
      it('should call generate_return_fail_snackbar_message()', () => {
        reset();

        service.generate_return_fail_snackbar_message(message);

        expect(service.generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call generate_return_fail_snackbar_message() and call diaplaySnackBar()', () => {
        reset();

        service.generate_return_fail_snackbar_message(message, { actionLabel: 'Close' });

        expect(service.displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('generate_return_error_snackbar_message()', () => {
      it('should call generate_return_error_snackbar_message()', () => {
        reset();

        service.generate_return_error_snackbar_message(message);

        expect(service.generate_return_error_snackbar_message).toHaveBeenCalled();
      });

      it('should call generate_return_error_snackbar_message() and call diaplaySnackBar()', () => {
        reset();

        service.generate_return_error_snackbar_message(message, { actionLabel: 'Close' });

        expect(service.displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('displaySnackBar()', () => {
      it('should call displaySnackBar() and display message with snackbarConfig undefined', () => {
        reset();

        service.displaySnackBar(message);

        expect(service.displaySnackBar).toHaveBeenCalled();
      });

      it('should call displaySnackBar() and display message with snackbarConfig provided as empty object', () => {
        reset();

        service.displaySnackBar(message, {});

        expect(service.displaySnackBar).toHaveBeenCalled();
      });

      it('should call displaySnackBar() and display message with snackbarConfig provided with only label', () => {
        reset();

        service.displaySnackBar(message, { actionLabel: 'Close' });

        expect(service.displaySnackBar).toHaveBeenCalled();
      });

      it('should call displaySnackBar() and perform callback on action', () => {
        reset();

        service.displaySnackBar(message, MockSnackBarConfigurationActionClass);

        expect(service.displaySnackBar).toHaveBeenCalled();
        service['matSnackBarRef_'].dismissWithAction();
      });
    });

    describe('destroySnackBar()', () => {
      it('should call destroySnackBar() and remove snackbar', () => {
        reset();

        service.displaySnackBar(message, MockSnackBarConfigurationActionClass);
        service.destroySnackBar();

        expect(service.destroySnackBar).toHaveBeenCalled();
      });
    });
  });
});

@Injectable()
export class MatSnackbarServiceSpy implements MatSnackbarServiceInterface {

  generate_return_success_snackbar_message = jasmine.createSpy('generate_return_success_snackbar_message').and.callFake(
    (message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void => {}
  );

  generate_return_fail_snackbar_message = jasmine.createSpy('generate_return_fail_snackbar_message').and.callFake(
    (message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void => {}
  );

  generate_return_error_snackbar_message = jasmine.createSpy('generate_return_error_snackbar_message').and.callFake(
    (message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void => {}
  );

  displaySnackBar = jasmine.createSpy('displaySnackBar').and.callFake(
    (message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void => {}
  );

  destroySnackBar = jasmine.createSpy('destroySnackBar').and.callFake(
    (): void => {}
  );
}
