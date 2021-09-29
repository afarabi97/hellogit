import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';

import {
  TextEditorConfigurationNoConfirmActionsInterface,
} from '../../../../../../static-data/interface-objects';
import { NGXMonacoTextEditorModule } from '../../ngx-monaco-text-editor.module';
import { NGXMonacoEditorComponent } from './ngx-monaco-editor.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('NGXMonacoEditorComponent', () => {
  let component: NGXMonacoEditorComponent;
  let fixture: ComponentFixture<NGXMonacoEditorComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyGetGetEditOptionClass: jasmine.Spy<any>;
  let spyOnKeyup: jasmine.Spy<any>;
  let spySelectionChangeLanguage: jasmine.Spy<any>;
  let spySelectionChangeTheme: jasmine.Spy<any>;
  let spySelectionChangeWordWrap: jasmine.Spy<any>;
  let spyChangeMinimap: jasmine.Spy<any>;
  let spyChangeCompareMode: jasmine.Spy<any>;
  let spyChangeInlineDiff: jasmine.Spy<any>;
  let spyGetReturnEditorText: jasmine.Spy<any>;

  // Test Data
  const language_mat_select_change: MatSelectChange = new MatSelectChange(null, 'json');
  const theme_mat_select_change: MatSelectChange = new MatSelectChange(null, 'vs');
  const wordwrap_mat_select_change: MatSelectChange = new MatSelectChange(null, 'on');
  const minimap_mat_checkbox_change_true: MatCheckboxChange = new MatCheckboxChange();
  minimap_mat_checkbox_change_true.source = null;
  minimap_mat_checkbox_change_true.checked = true;
  const minimap_mat_checkbox_change_false: MatCheckboxChange = new MatCheckboxChange();
  minimap_mat_checkbox_change_false.source = null;
  minimap_mat_checkbox_change_false.checked = false;
  const compare_mat_checkbox_change_true: MatCheckboxChange = new MatCheckboxChange();
  compare_mat_checkbox_change_true.source = null;
  compare_mat_checkbox_change_true.checked = true;
  const compare_mat_checkbox_change_false: MatCheckboxChange = new MatCheckboxChange();
  compare_mat_checkbox_change_false.source = null;
  compare_mat_checkbox_change_false.checked = false;
  const inline_mat_checkbox_change: MatCheckboxChange = new MatCheckboxChange();
  inline_mat_checkbox_change.source = null;
  inline_mat_checkbox_change.checked = true;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NGXMonacoTextEditorModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NGXMonacoEditorComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyGetGetEditOptionClass = spyOn(component, 'get_edit_option_class').and.callThrough();
    spyOnKeyup = spyOn(component, 'on_keyup').and.callThrough();
    spySelectionChangeLanguage = spyOn(component, 'selection_change_language').and.callThrough();
    spySelectionChangeTheme = spyOn(component, 'selection_change_theme').and.callThrough();
    spySelectionChangeWordWrap = spyOn(component, 'selection_change_word_wrap').and.callThrough();
    spyChangeMinimap = spyOn(component, 'change_minimap').and.callThrough();
    spyChangeCompareMode = spyOn(component, 'change_compare_mode').and.callThrough();
    spyChangeInlineDiff = spyOn(component, 'change_inline_diff').and.callThrough();
    spyGetReturnEditorText = spyOn<any>(component, 'get_return_editor_text_').and.callThrough();

    // Add EventEmitter Spy
    spyOn(component.editor_text, 'emit');

    // Set Component @Input() Data
    component.show_options = TextEditorConfigurationNoConfirmActionsInterface.show_options;
    component.is_read_only = TextEditorConfigurationNoConfirmActionsInterface.is_read_only;
    component.text = TextEditorConfigurationNoConfirmActionsInterface.text;
    component.use_language = TextEditorConfigurationNoConfirmActionsInterface.use_language;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyGetGetEditOptionClass.calls.reset();
    spyOnKeyup.calls.reset();
    spySelectionChangeLanguage.calls.reset();
    spySelectionChangeTheme.calls.reset();
    spySelectionChangeWordWrap.calls.reset();
    spyChangeMinimap.calls.reset();
    spyChangeCompareMode.calls.reset();
    spyChangeInlineDiff.calls.reset();
    spyGetReturnEditorText.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create NGXMonacoEditorComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NGXMonacoEditorComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call ngOnInit() and call get_return_editor_text_()', () => {
        reset();

        component.ngOnInit();

        expect(component['get_return_editor_text_']).toHaveBeenCalled();
      });

      it('should call ngOnInit() and set component variables from passed @Input() variables', () => {
        reset();

        component.ngOnInit();

        expect(component.text1).toEqual(component.text);
        expect(component.text2).toEqual(component.text);
        expect(component.selected_lang).toEqual(component.use_language);
        expect(component.modified_options).toBeDefined();
        expect(typeof component.modified_options).toEqual('object');
        expect(component.original_options).toBeDefined();
        expect(typeof component.original_options).toEqual('object');
        expect(component.diff_options).toBeDefined();
        expect(typeof component.diff_options).toEqual('object');
        expect(component.original_model).toBeDefined();
        expect(typeof component.original_model).toEqual('object');
        expect(component.modified_model).toBeDefined();
        expect(typeof component.modified_model).toEqual('object');
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;

        component.ngOnChanges(simple_changes);

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call ngOnChanges() and handle @Input() text change', () => {
        reset();

        expect(component.text1).toEqual(TextEditorConfigurationNoConfirmActionsInterface.text);
        expect(component.text2).toEqual(TextEditorConfigurationNoConfirmActionsInterface.text);

        component.text = 'current text';
        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const text_simple_change: SimpleChange = new SimpleChange('previous text', 'current text', true);
        simple_changes['text'] = text_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component.text1).toEqual(component.text);
        expect(component.text2).toEqual(component.text);
      });

      it('should call ngOnChanges() and handle @Input() is_read_only change', () => {
        reset();

        expect(component.modified_options.readOnly).toBeFalse();

        component.text = 'current text';
        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const is_read_only_simple_change: SimpleChange = new SimpleChange(false, true, true);
        simple_changes['is_read_only'] = is_read_only_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component.modified_options.readOnly).toBeTrue();
      });
    });

    describe('get_edit_option_class()', () => {
      it('should call get_edit_option_class()', () => {
        reset();

        component.get_edit_option_class();

        expect(component.get_edit_option_class).toHaveBeenCalled();
      });

      it('should call get_edit_option_class() and return known Object', () => {
        reset();

        const return_value: Object = component.get_edit_option_class();

        expect(return_value['option-button']).toBeTrue();
        expect(return_value['option-button-light']).toBeFalse();
        expect(return_value['option-button-dark']).toBeTrue();
      });
    });

    describe('on_keyup()', () => {
      it('should call on_keyup()', () => {
        reset();

        component.on_keyup();

        expect(component.on_keyup).toHaveBeenCalled();
      });
    });

    describe('selection_change_language()', () => {
      it('should call selection_change_language()', () => {
        reset();

        component.selection_change_language(language_mat_select_change);

        expect(component.selection_change_language).toHaveBeenCalled();
      });

      it('should call selection_change_language() and set language in known objects from event', () => {
        reset();

        expect(component.modified_options.language).toEqual(TextEditorConfigurationNoConfirmActionsInterface.use_language);
        expect(component.original_options.language).toEqual(TextEditorConfigurationNoConfirmActionsInterface.use_language);
        expect(component.diff_options.language).toEqual(TextEditorConfigurationNoConfirmActionsInterface.use_language);
        expect(component.original_model.language).toEqual(TextEditorConfigurationNoConfirmActionsInterface.use_language);
        expect(component.modified_model.language).toEqual(TextEditorConfigurationNoConfirmActionsInterface.use_language);

        component.selection_change_language(language_mat_select_change);

        expect(component.modified_options.language).toEqual(language_mat_select_change.value);
        expect(component.original_options.language).toEqual(language_mat_select_change.value);
        expect(component.diff_options.language).toEqual(language_mat_select_change.value);
        expect(component.original_model.language).toEqual(language_mat_select_change.value);
        expect(component.modified_model.language).toEqual(language_mat_select_change.value);
      });
    });

    describe('selection_change_theme()', () => {
      it('should call selection_change_theme()', () => {
        reset();

        component.selection_change_theme(theme_mat_select_change);

        expect(component.selection_change_theme).toHaveBeenCalled();
      });

      it('should call selection_change_theme() and set theme in known objects from event', () => {
        reset();

        expect(component.modified_options.theme).toEqual(component.selected_theme);
        expect(component.original_options.theme).toEqual(component.selected_theme);
        expect(component.diff_options.theme).toEqual(component.selected_theme);

        component.selection_change_theme(theme_mat_select_change);

        expect(component.modified_options.theme).toEqual(theme_mat_select_change.value);
        expect(component.original_options.theme).toEqual(theme_mat_select_change.value);
        expect(component.diff_options.theme).toEqual(theme_mat_select_change.value);
      });
    });

    describe('selection_change_word_wrap()', () => {
      it('should call selection_change_word_wrap()', () => {
        reset();

        component.selection_change_word_wrap(wordwrap_mat_select_change);

        expect(component.selection_change_word_wrap).toHaveBeenCalled();
      });

      it('should call selection_change_word_wrap() and set wordwrap in known objects from event', () => {
        reset();

        expect(component.modified_options.wordWrap).toEqual('off');
        expect(component.original_options.wordWrap).toEqual('off');
        expect(component.diff_options.wordWrap).toEqual('off');

        component.selection_change_word_wrap(wordwrap_mat_select_change);

        expect(component.modified_options.wordWrap).toEqual(wordwrap_mat_select_change.value);
        expect(component.original_options.wordWrap).toEqual(wordwrap_mat_select_change.value);
        expect(component.diff_options.wordWrap).toEqual(wordwrap_mat_select_change.value);
      });
    });

    describe('change_minimap()', () => {
      it('should call change_minimap()', () => {
        reset();

        component.change_minimap(minimap_mat_checkbox_change_true);

        expect(component.change_minimap).toHaveBeenCalled();
      });

      it('should call change_minimap() and set minimap.enabled to true in known objects from event', () => {
        reset();

        expect(component.modified_options.minimap.enabled).toBeFalse();
        expect(component.original_options.minimap.enabled).toBeFalse();
        expect(component.diff_options.minimap.enabled).toBeFalse();

        component.change_minimap(minimap_mat_checkbox_change_true);

        expect(component.modified_options.minimap.enabled).toBeTrue();
        expect(component.original_options.minimap.enabled).toBeTrue();
        expect(component.diff_options.minimap.enabled).toBeTrue();
      });

      it('should call change_minimap() and set minimap.enabled to true in known objects from event', () => {
        reset();

        expect(component.modified_options.minimap.enabled).toBeFalse();
        expect(component.original_options.minimap.enabled).toBeFalse();
        expect(component.diff_options.minimap.enabled).toBeFalse();

        component.change_minimap(minimap_mat_checkbox_change_false);

        expect(component.modified_options.minimap.enabled).toBeFalse();
        expect(component.original_options.minimap.enabled).toBeFalse();
        expect(component.diff_options.minimap.enabled).toBeFalse();
      });
    });

    describe('change_compare_mode()', () => {
      it('should call change_compare_mode()', () => {
        reset();

        component.change_compare_mode(compare_mat_checkbox_change_true);

        expect(component.change_compare_mode).toHaveBeenCalled();
      });

      it('should call change_compare_mode() and set compare_mode to true from event', () => {
        reset();

        expect(component.compare_mode).toBeFalse();

        component.change_compare_mode(compare_mat_checkbox_change_true);

        expect(component.compare_mode).toBeTrue();
      });

      it('should call change_compare_mode() and set inline_diff to false', () => {
        reset();

        expect(component.inline_diff).toBeFalse();

        component.inline_diff = true;

        expect(component.inline_diff).toBeTrue();

        component.change_compare_mode(compare_mat_checkbox_change_false);

        expect(component.inline_diff).toBeFalse();
      });
    });

    describe('change_inline_diff()', () => {
      it('should call change_inline_diff()', () => {
        reset();

        component.change_inline_diff(inline_mat_checkbox_change);

        expect(component.change_inline_diff).toHaveBeenCalled();
      });

      it('should call change_inline_diff() and set known objects from event', () => {
        reset();

        component.ngOnInit();

        expect(component.original_model.code).toEqual('');
        expect(component.modified_model.code).toEqual('');
        expect(component.diff_options.renderSideBySide).toBeTrue();

        component.text1 = 'Fake Text';
        component.text2 = 'Fake Text';

        component.change_inline_diff(inline_mat_checkbox_change);

        expect(component.original_model.code).toEqual(component.text1);
        expect(component.modified_model.code).toEqual(component.text2);
        expect(component.diff_options.renderSideBySide).toBeFalse();
      });
    });

    describe('private get_return_editor_text_()', () => {
      it('should call get_return_editor_text_()', () => {
        reset();

        component['get_return_editor_text_']();

        expect(component['get_return_editor_text_']).toHaveBeenCalled();
      });

      it('should call get_return_editor_text_() and emit event on subscribe', () => {
        reset();

        component['get_return_editor_text_']();

        component.return_editor_text$.next();

        expect(component.editor_text.emit).toHaveBeenCalledWith(component.text1);
      });
    });
  });
});
