import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { remove_styles_from_dom } from '../../../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../../../testing-modules/testing.module';
import { CopyTokenDialogDataInterface } from '../../../../interfaces';
import { SystemSettingsModule } from '../../../../system-settings.module';
import { CopyTokenDialogComponent } from './copy-token-dialog.component';
import { ClipboardModule } from '@angular/cdk/clipboard';

describe('CopyTokenDialogComponent', () => {
  let component: CopyTokenDialogComponent;
  let fixture: ComponentFixture<CopyTokenDialogComponent>;

  // Setup spy references
  let spyClickButtonCopyToken: jasmine.Spy<any>;
  let spyClickButtonClose: jasmine.Spy<any>;

  // Test Data
  const MOCK_DIALOG_DATA__COPY_TOKEN_DIALOG_DATA: CopyTokenDialogDataInterface = {
    title: 'Fake Title',
    token: 'kedshfkh.ksjdhfakss'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SystemSettingsModule,
        TestingModule,
        ClipboardModule
      ],
      providers: [
        Clipboard,
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA__COPY_TOKEN_DIALOG_DATA }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyTokenDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyClickButtonCopyToken = spyOn(component, 'click_button_copy_token').and.callThrough();
    spyClickButtonClose = spyOn(component, 'click_button_close').and.callThrough();

    // create extra spies
    spyOn(component['clipboard_'], 'copy').and.returnValue(true);


    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyClickButtonCopyToken.calls.reset();
    spyClickButtonClose.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create CopyTokenDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('CopyTokenDialogComponent methods', () => {
    describe('click_button_copy_token()', () => {
      it('should call click_button_copy_token()', () => {
        reset();

        component.click_button_copy_token();

        expect(component.click_button_copy_token).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from click_button_copy_token()', () => {
        reset();

        component.click_button_copy_token();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('click_button_close()', () => {
      it('should call click_button_close()', () => {
        reset();

        component.click_button_close();

        expect(component.click_button_close).toHaveBeenCalled();
      });

      it('should call mat_dialog_ref_.close() from click_button_close()', () => {
        reset();

        component.click_button_close();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });
  });
});
