import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DialogDataInterface } from '../../interfaces';
import { GenericDialogComponent } from './generic-dialog.component';
import { GenericDialogModule } from './generic-dialog.module';

export function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

@Component({
  template: `
    <ng-template #fakeTemplateRef></ng-template>
  `,
})
class WrapperComponent {
  @ViewChild('fakeTemplateRef') fake_template_ref: TemplateRef<any>;
}

describe('GenericDialogComponent', () => {
  let component: GenericDialogComponent<undefined>;
  let fixture: ComponentFixture<GenericDialogComponent<undefined>>;

  // Setup spy references
  let spyCheckVariableValueDefined: jasmine.Spy<any>;

  // Test Data
  const variable_defined: string = 'test';
  const variable_undefined: string = undefined;
  const variable_null: string = null;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GenericDialogModule
      ],
      declarations: [
        WrapperComponent
      ],
      providers: [
        { provide: MatDialogRef , useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyCheckVariableValueDefined = spyOn(component, 'check_variable_value_defined').and.callThrough();

    // Set Test Data
    const fixture_wrapper = TestBed.createComponent(WrapperComponent);
    const wrapper_component = fixture_wrapper.debugElement.componentInstance;
    const fake_template_ref = wrapper_component.fake_template_ref;
    const mock_mat_dialog_data: DialogDataInterface<any> = {
      title: 'Fake Title',
      template: fake_template_ref
    };

    // Test Constructor Data
    component.mat_dialog_data = mock_mat_dialog_data;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyCheckVariableValueDefined.calls.reset();
  };

  afterAll(() => cleanStylesFromDOM());

  it('should create GenericDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('GenericDialogComponent methods', () => {
    describe('check_variable_value_defined()', () => {
      it('should call check_variable_value_defined()', () => {
        reset();

        component.check_variable_value_defined(variable_defined);

        expect(component.check_variable_value_defined).toHaveBeenCalled();
      });

      it('should call check_variable_value_defined() and return true when passed defined variable', () => {
        reset();

        const return_value: boolean = component.check_variable_value_defined(variable_defined);

        expect(return_value).toBeTrue();
      });

      it('should call check_variable_value_defined() and return false when passed undefined variable', () => {
        reset();

        const return_value: boolean = component.check_variable_value_defined(variable_undefined);

        expect(return_value).toBeFalse();
      });

      it('should call check_variable_value_defined() and return false when passed null variable', () => {
        reset();

        const return_value: boolean = component.check_variable_value_defined(variable_null);

        expect(return_value).toBeFalse();
      });
    });
  });
});
