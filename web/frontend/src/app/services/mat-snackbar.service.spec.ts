import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MockSnackBarConfigurationActionClass } from '../../../static-data/class-objects-v3_4';
import { MatSnackbarConfigurationClass } from '../classes';
import { MatSnackbarServiceInterface } from '../interfaces';
import { MatSnackBarService } from './mat-snackbar.service';

describe('MatSnackBarService', () => {
  let service: MatSnackBarService;

  // Spy's
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

    spyDisplaySnackBar = spyOn(service, 'displaySnackBar').and.callThrough();
    spyDestroySnackBar = spyOn(service, 'destroySnackBar').and.callThrough();
  });

  const reset = () => {
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

  displaySnackBar = jasmine.createSpy('displaySnackBar').and.callFake(
    (message: string, matSnackbarConfigurationClass?: MatSnackbarConfigurationClass): void => {}
  );

  destroySnackBar = jasmine.createSpy('destroySnackBar').and.callFake(
    (): void => {}
  );
}
