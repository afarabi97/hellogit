import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MaterialModule } from 'src/app/modules/utilily-modules/material.module';
import { MatInputModule } from '@angular/material/input';

import { MockConfirmDialogMatDialogDataInterface } from '../../../../static-data/interface-objects';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { FormsModule } from '@angular/forms';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  // Setup spy references
  let spyCheckVariableValueDefined: jasmine.Spy<any>;
  let spyIsDoubleConfirmMessageTyped: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [
        ConfirmDialogComponent
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MockConfirmDialogMatDialogDataInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyCheckVariableValueDefined = spyOn(component, 'check_variable_value_defined').and.callThrough();
    spyIsDoubleConfirmMessageTyped = spyOn(component, 'is_double_confirm_message_typed').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyCheckVariableValueDefined.calls.reset();
    spyIsDoubleConfirmMessageTyped.calls.reset();
    spyClose.calls.reset();
  };

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();

    cleanStylesFromDOM();
  });

  it('should create ConfirmDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ConfirmDialogComponent methods', () => {
    describe('check_variable_value_defined()', () => {
      it('should call check_variable_value_defined()', () => {
        reset();

        component.check_variable_value_defined('test');

        expect(component.check_variable_value_defined).toHaveBeenCalled();
      });

      it('should call check_variable_value_defined() and return true', () => {
        reset();

        const return_value: boolean = component.check_variable_value_defined('test');

        expect(return_value).toBeTrue();
      });

      it('should call check_variable_value_defined() and return false', () => {
        reset();

        const return_value: boolean = component.check_variable_value_defined(undefined);

        expect(return_value).toBeFalse();
      });
    });
  });

  describe('is_double_confirm_message_typed()', () => {
    it('should call is_double_confirm_message_typed()', () => {
      reset();

      component.is_double_confirm_message_typed();

      expect(component.is_double_confirm_message_typed).toHaveBeenCalled();
    });

    it('should call is_double_confirm_message_typed() and return true', () => {
      reset();

      component.double_confirm_value = MockConfirmDialogMatDialogDataInterface.message_double_confirm;
      const return_value: boolean = component.is_double_confirm_message_typed();

      expect(return_value).toBeTrue();
    });

    it('should call is_double_confirm_message_typed() and return false', () => {
      reset();

      const return_value: boolean = component.is_double_confirm_message_typed();

      expect(return_value).toBeFalse();
    });
  });

  describe('close()', () => {
    it('should call close()', () => {
      reset();

      component.close(MockConfirmDialogMatDialogDataInterface.option1);

      expect(component.close).toHaveBeenCalled();
    });

    it('should call close() and pass mat_dialog_data.option1 on mat_dialog_ref_.close()', () => {
      reset();

      jasmine.getEnv().allowRespy(true);
      spyOn(component['mat_dialog_ref_'], 'afterClosed').and.returnValue(of(MockConfirmDialogMatDialogDataInterface.option1));

      component.close(MockConfirmDialogMatDialogDataInterface.option1);
      component['mat_dialog_ref_'].afterClosed()
        .pipe(takeUntil(ngUnsubscribe$))
        .subscribe((response: string) => expect(response).toEqual(MockConfirmDialogMatDialogDataInterface.option1));
    });

    it('should call close() and pass mat_dialog_data.option2 on mat_dialog_ref_.close()', () => {
      reset();

      jasmine.getEnv().allowRespy(true);
      spyOn(component['mat_dialog_ref_'], 'afterClosed').and.returnValue(of(MockConfirmDialogMatDialogDataInterface.option2));

      component.close(MockConfirmDialogMatDialogDataInterface.option2);
      component['mat_dialog_ref_'].afterClosed()
        .pipe(takeUntil(ngUnsubscribe$))
        .subscribe((response: string) => expect(response).toEqual(MockConfirmDialogMatDialogDataInterface.option2));
    });
  });
});
