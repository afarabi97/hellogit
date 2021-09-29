import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import {
  ConfirmActionConfigurationCloseAltActionFunctionTrueInterface,
  ConfirmActionConfigurationSaveAltActionFunctionTrueInterface,
  TextEditorConfigurationAltActionFuncFalseInterface,
  TextEditorConfigurationAltActionFuncTrueInterface,
  TextEditorConfigurationNoConfirmActionsInterface
} from '../../../../static-data/interface-objects';
import { ConfirmActionPopup } from '../../classes/ConfirmActionPopup';
import { CLOSE_DEFAULT_TOOLTIP, SAVE_DEFAULT_TOOLTIP } from './constants/ngx-monaco-editor.constants';
import { NGXMonacoTextEditorComponent } from './ngx-monaco-text-editor.component';
import { NGXMonacoTextEditorModule } from './ngx-monaco-text-editor.module';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

class MatDialogMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

describe('NGXMonacoTextEditorComponent', () => {
  let component: NGXMonacoTextEditorComponent;
  let fixture: ComponentFixture<NGXMonacoTextEditorComponent>;

  // Setup spy references
  let spyHasTitle: jasmine.Spy<any>;
  let spyGetSaveTooltip: jasmine.Spy<any>;
  let spyGetCloseTooltip: jasmine.Spy<any>;
  let spyGetDisabledSave: jasmine.Spy<any>;
  let spySaveClick: jasmine.Spy<any>;
  let spySave: jasmine.Spy<any>;
  let spyCloseClick: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spyGetReturnText: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NGXMonacoTextEditorModule
      ],
      providers: [
        ConfirmActionPopup,
        { provide: MatDialogRef, useClass: MatDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: TextEditorConfigurationNoConfirmActionsInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NGXMonacoTextEditorComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyHasTitle = spyOn(component, 'has_title').and.callThrough();
    spyGetSaveTooltip = spyOn(component, 'get_save_tooltip').and.callThrough();
    spyGetCloseTooltip = spyOn(component, 'get_close_tooltip').and.callThrough();
    spyGetDisabledSave = spyOn(component, 'get_disabled_save').and.callThrough();
    spySaveClick = spyOn(component, 'save_click').and.callThrough();
    spySave = spyOn(component, 'save').and.callThrough();
    spyCloseClick = spyOn(component, 'close_click').and.callThrough();
    spyClose = spyOn<any>(component, 'close_').and.callThrough();
    spyGetReturnText = spyOn<any>(component, 'get_return_text_').and.callThrough();

    // Add service spies
    spyOn<any>(component['confirm_action_dialog_'], 'confirmAction').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyHasTitle.calls.reset();
    spyGetSaveTooltip.calls.reset();
    spyGetCloseTooltip.calls.reset();
    spyGetDisabledSave.calls.reset();
    spySaveClick.calls.reset();
    spySave.calls.reset();
    spyCloseClick.calls.reset();
    spyClose.calls.reset();
    spyGetReturnText.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create NGXMonacoTextEditorComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NGXMonacoTextEditorComponent methods', () => {
    describe('has_title()', () => {
      it('should call has_title()', () => {
        reset();

        component.has_title();

        expect(component.has_title).toHaveBeenCalled();
      });

      it('should call has_title() and return true', () => {
        reset();

        const return_value: boolean = component.has_title();

        expect(return_value).toBeTrue();
      });

      it('should call has_title() and return false', () => {
        reset();

        component.title = undefined;
        const return_value: boolean = component.has_title();

        expect(return_value).toBeFalse();
      });
    });

    describe('get_save_tooltip()', () => {
      it('should call get_save_tooltip()', () => {
        reset();

        component.get_save_tooltip();

        expect(component.get_save_tooltip).toHaveBeenCalled();
      });

      it('should call get_save_tooltip() and return passed save button tooltip', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_save_tooltip();

        expect(return_value).toEqual(ConfirmActionConfigurationSaveAltActionFunctionTrueInterface.title);
      });

      it('should call has_title() and return default save tooltip', () => {
        reset();

        const return_value: string = component.get_save_tooltip();

        expect(return_value).toEqual(SAVE_DEFAULT_TOOLTIP);
      });
    });

    describe('get_close_tooltip()', () => {
      it('should call get_close_tooltip()', () => {
        reset();

        component.get_close_tooltip();

        expect(component.get_close_tooltip).toHaveBeenCalled();
      });

      it('should call get_close_tooltip() and return passed close button tooltip', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_close_tooltip();

        expect(return_value).toEqual(ConfirmActionConfigurationCloseAltActionFunctionTrueInterface.title);
      });

      it('should call get_close_tooltip() and return default close tooltip', () => {
        reset();

        const return_value: string = component.get_close_tooltip();

        expect(return_value).toEqual(CLOSE_DEFAULT_TOOLTIP);
      });
    });

    describe('get_disabled_save()', () => {
      it('should call get_disabled_save()', () => {
        reset();

        component.get_disabled_save();

        expect(component.get_disabled_save).toHaveBeenCalled();
      });

      it('should call get_disabled_save() and return passed diabled save value', () => {
        reset();

        const return_value: boolean = component.get_disabled_save();

        expect(return_value).toBeFalse();
      });
    });

    describe('save_click()', () => {
      it('should call save_click()', () => {
        reset();

        component.save_click();

        expect(component.save_click).toHaveBeenCalled();
      });

      it('should call save_click() and call confirm_action_dialog_.confirmAction()', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.save_click();

        expect(component['confirm_action_dialog_'].confirmAction).toHaveBeenCalled();
      });

      it('should call save_click() and reference get_return_text_() from check', () => {
        reset();

        // Add spy to trigger action function
        spyOn(component['confirm_action_dialog_']['dialog'], 'open').and.returnValue({ afterClosed: () => of(component['mat_dialog_data_'].confirm_save.confirmButtonText) } as MatDialogRef<typeof component>);

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.save_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_save.useGeneralActionFunc).toBeTrue();
      });

      it('should call save_click() and reference actionFunc', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncFalseInterface;
        component.save_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_save.useGeneralActionFunc).toBeFalse();
      });

      it('should call save_click() and call get_return_text_()', () => {
        reset();

        component.save_click();

        expect(component['get_return_text_']).toHaveBeenCalled();
      });
    });

    describe('save()', () => {
      it('should call save()', () => {
        reset();

        component.save('Fake Text');

        expect(component.save).toHaveBeenCalled();
      });
    });

    describe('close_click()', () => {
      it('should call close_click()', () => {
        reset();

        component.close_click();

        expect(component.close_click).toHaveBeenCalled();
      });

      it('should call close_click() and call confirm_action_dialog_.confirmAction()', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.close_click();

        expect(component['confirm_action_dialog_'].confirmAction).toHaveBeenCalled();
      });

      it('should call close_click() and reference close_() from check', () => {
        reset();

        // Add spy to trigger action function
        spyOn(component['confirm_action_dialog_']['dialog'], 'open').and.returnValue({ afterClosed: () => of(component['mat_dialog_data_'].confirm_close.confirmButtonText) } as MatDialogRef<typeof component>);

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.close_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_close.useGeneralActionFunc).toBeTrue();
      });

      it('should call close_click() and reference actionFunc', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncFalseInterface;
        component.close_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_close.useGeneralActionFunc).toBeFalse();
      });

      it('should call close_click() and call close_()', () => {
        reset();

        component.close_click();

        expect(component['close_']).toHaveBeenCalled();
      });
    });

    describe('private close_()', () => {
      it('should call close_()', () => {
        reset();

        component['close_']();

        expect(component['close_']).toHaveBeenCalled();
      });
    });

    describe('private get_return_text_()', () => {
      it('should call get_return_text_()', () => {
        reset();

        component['get_return_text_']();

        expect(component['get_return_text_']).toHaveBeenCalled();
      });
    });
  });
});
