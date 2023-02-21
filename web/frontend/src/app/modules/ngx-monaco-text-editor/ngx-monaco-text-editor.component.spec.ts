import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import {
  ConfirmActionConfigurationCloseAltActionFunctionTrueInterface,
  ConfirmActionConfigurationSaveAltActionFunctionTrueInterface,
  TextEditorConfigurationAltActionFuncFalseInterface,
  TextEditorConfigurationAltActionFuncTrueInterface,
  TextEditorConfigurationNoConfirmActionsInterface
} from '../../../../static-data/interface-objects';
import { ConfirmActionPopup } from '../../classes/ConfirmActionPopup';
import {
  CLOSE_BUTTON_TEXT,
  CLOSE_DEFAULT_TOOLTIP,
  SAVE_BUTTON_TEXT,
  SAVE_DEFAULT_TOOLTIP
} from './constants/ngx-monaco-editor.constants';
import { NGXMonacoTextEditorComponent } from './ngx-monaco-text-editor.component';
import { NGXMonacoTextEditorModule } from './ngx-monaco-text-editor.module';

describe('NGXMonacoTextEditorComponent', () => {
  let component: NGXMonacoTextEditorComponent;
  let fixture: ComponentFixture<NGXMonacoTextEditorComponent>;

  // Setup spy references
  let spyHasTitle: jasmine.Spy<any>;
  let spyGetActionButtonText: jasmine.Spy<any>;
  let spyGetNonActionButtonText: jasmine.Spy<any>;
  let spyGetActionTooltip: jasmine.Spy<any>;
  let spyGetNonActionTooltip: jasmine.Spy<any>;
  let spyGetDisabledSave: jasmine.Spy<any>;
  let spySetTextChanged: jasmine.Spy<any>;
  let spyActionClick: jasmine.Spy<any>;
  let spySave: jasmine.Spy<any>;
  let spyNonActionClick: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spyGetReturnText: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NGXMonacoTextEditorModule
      ],
      providers: [
        ConfirmActionPopup,
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: TextEditorConfigurationNoConfirmActionsInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NGXMonacoTextEditorComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyHasTitle = spyOn(component, 'has_title').and.callThrough();
    spyGetActionButtonText = spyOn(component, 'get_action_button_text').and.callThrough();
    spyGetNonActionButtonText = spyOn(component, 'get_non_action_button_text').and.callThrough();
    spyGetActionTooltip = spyOn(component, 'get_action_tooltip').and.callThrough();
    spyGetNonActionTooltip = spyOn(component, 'get_non_action_tooltip').and.callThrough();
    spyGetDisabledSave = spyOn(component, 'get_disabled_save').and.callThrough();
    spySetTextChanged = spyOn(component, 'set_text_changed').and.callThrough();
    spyActionClick = spyOn(component, 'action_click').and.callThrough();
    spySave = spyOn(component, 'save').and.callThrough();
    spyNonActionClick = spyOn(component, 'non_action_click').and.callThrough();
    spyClose = spyOn<any>(component, 'close_').and.callThrough();
    spyGetReturnText = spyOn<any>(component, 'get_return_text_').and.callThrough();

    // Add service spies
    spyOn<any>(component['confirm_action_dialog_'], 'confirmAction').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyHasTitle.calls.reset();
    spyGetActionButtonText.calls.reset();
    spyGetNonActionButtonText.calls.reset();
    spyGetActionTooltip.calls.reset();
    spyGetNonActionTooltip.calls.reset();
    spyGetDisabledSave.calls.reset();
    spySetTextChanged.calls.reset();
    spyActionClick.calls.reset();
    spySave.calls.reset();
    spyNonActionClick.calls.reset();
    spyClose.calls.reset();
    spyGetReturnText.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

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

    describe('get_action_button_text()', () => {
      it('should call get_action_button_text()', () => {
        reset();

        component.get_action_button_text();

        expect(component.get_action_button_text).toHaveBeenCalled();
      });

      it('should call get_action_button_text() and return passed action button text', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_action_button_text();

        expect(return_value).toEqual(ConfirmActionConfigurationSaveAltActionFunctionTrueInterface.confirmButtonText);
      });

      it('should call get_action_button_text() and return default value', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationNoConfirmActionsInterface;
        const return_value: string = component.get_action_button_text();

        expect(return_value).toEqual(SAVE_BUTTON_TEXT);
      });
    });

    describe('get_non_action_button_text()', () => {
      it('should call get_non_action_button_text()', () => {
        reset();

        component.get_non_action_button_text();

        expect(component.get_non_action_button_text).toHaveBeenCalled();
      });

      it('should call get_non_action_button_text() and return passed non-action button text', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_non_action_button_text();

        expect(return_value).toEqual(ConfirmActionConfigurationCloseAltActionFunctionTrueInterface.confirmButtonText);
      });

      it('should call get_action_button_text() and return default value', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationNoConfirmActionsInterface;
        const return_value: string = component.get_non_action_button_text();

        expect(return_value).toEqual(CLOSE_BUTTON_TEXT);
      });
    });

    describe('get_action_tooltip()', () => {
      it('should call get_action_tooltip()', () => {
        reset();

        component.get_action_tooltip();

        expect(component.get_action_tooltip).toHaveBeenCalled();
      });

      it('should call get_action_tooltip() and return passed save button tooltip', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_action_tooltip();

        expect(return_value).toEqual(ConfirmActionConfigurationSaveAltActionFunctionTrueInterface.title);
      });

      it('should call has_title() and return default save tooltip', () => {
        reset();

        const return_value: string = component.get_action_tooltip();

        expect(return_value).toEqual(SAVE_DEFAULT_TOOLTIP);
      });
    });

    describe('get_non_action_tooltip()', () => {
      it('should call get_non_action_tooltip()', () => {
        reset();

        component.get_non_action_tooltip();

        expect(component.get_non_action_tooltip).toHaveBeenCalled();
      });

      it('should call get_non_action_tooltip() and return passed close button tooltip', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        const return_value: string = component.get_non_action_tooltip();

        expect(return_value).toEqual(ConfirmActionConfigurationCloseAltActionFunctionTrueInterface.title);
      });

      it('should call get_non_action_tooltip() and return default close tooltip', () => {
        reset();

        const return_value: string = component.get_non_action_tooltip();

        expect(return_value).toEqual(CLOSE_DEFAULT_TOOLTIP);
      });
    });

    describe('get_disabled_save()', () => {
      it('should call get_disabled_save()', () => {
        reset();

        component.get_disabled_save();

        expect(component.get_disabled_save).toHaveBeenCalled();
      });

      it('should call get_disabled_save() and return passed disabled save value', () => {
        reset();

        const return_value: boolean = component.get_disabled_save();

        expect(return_value).toBeFalse();
      });

      it('should call get_disabled_save() and return !text_changed_', () => {
        reset();

        component['text_changed'] = true;
        const return_value: boolean = component.get_disabled_save();

        expect(return_value).toBeFalse();
      });
    });

    describe('set_text_changed()', () => {
      it('should call set_text_changed()', () => {
        reset();

        component.text = 'test';
        component.set_text_changed('test');

        expect(component.set_text_changed).toHaveBeenCalled();
      });

      it('should call set_text_changed() and return set text_changed = true', () => {
        reset();

        component.text = 'test';
        component.set_text_changed('test change');

        expect(component['text_changed_']).toBeTrue();
      });

      it('should call set_text_changed() and return set text_changed = false', () => {
        reset();

        component.text = 'test';
        component.set_text_changed('test');

        expect(component['text_changed_']).toBeFalse();
      });
    });

    describe('action_click()', () => {
      it('should call action_click()', () => {
        reset();

        component.action_click();

        expect(component.action_click).toHaveBeenCalled();
      });

      it('should call action_click() and call confirm_action_dialog_.confirmAction()', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.action_click();

        expect(component['confirm_action_dialog_'].confirmAction).toHaveBeenCalled();
      });

      it('should call action_click() and reference get_return_text_() from check', () => {
        reset();

        // Add spy to trigger action function
        spyOn(component['confirm_action_dialog_']['dialog'], 'open').and.returnValue({ afterClosed: () => of(component['mat_dialog_data_'].confirm_save.confirmButtonText) } as MatDialogRef<typeof component>);

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.action_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_save.useGeneralActionFunc).toBeTrue();
      });

      it('should call action_click() and reference actionFunc', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncFalseInterface;
        component.action_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_save.useGeneralActionFunc).toBeFalse();
      });

      it('should call action_click() and call get_return_text_()', () => {
        reset();

        component.action_click();

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

    describe('non_action_click()', () => {
      it('should call non_action_click()', () => {
        reset();

        component.non_action_click();

        expect(component.non_action_click).toHaveBeenCalled();
      });

      it('should call non_action_click() and call confirm_action_dialog_.confirmAction()', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.non_action_click();

        expect(component['confirm_action_dialog_'].confirmAction).toHaveBeenCalled();
      });

      it('should call non_action_click() and reference close_() from check', () => {
        reset();

        // Add spy to trigger action function
        spyOn(component['confirm_action_dialog_']['dialog'], 'open').and.returnValue({ afterClosed: () => of(component['mat_dialog_data_'].confirm_close.confirmButtonText) } as MatDialogRef<typeof component>);

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncTrueInterface;
        component.non_action_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_close.useGeneralActionFunc).toBeTrue();
      });

      it('should call non_action_click() and reference actionFunc', () => {
        reset();

        component['mat_dialog_data_'] = TextEditorConfigurationAltActionFuncFalseInterface;
        component.non_action_click();

        // No way to see if return function passed but can check that variables within
        // object used to pass return function would lead to result
        expect(component['mat_dialog_data_'].confirm_close.useGeneralActionFunc).toBeFalse();
      });

      it('should call non_action_click() and call close_()', () => {
        reset();

        component.non_action_click();

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
