import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockUnusedIpAddresses } from '../../../../../../static-data/return-data';
import { MipManagementComponent } from '../../../mip-mng/mip-mng.component';
import { NodeManagementComponent } from '../../../node-mng/node-mng.component';
import { TestingModule } from '../../../testing-modules/testing.module';
import { GlobalComponentsModule } from '../../global-components.module';
import { UnusedIpAddressAutoCompleteComponent } from './unused-ipaddress-autocomplete-ctrl.component';

describe('UnusedIpAddressAutoCompleteComponent', () => {
  let component: UnusedIpAddressAutoCompleteComponent;
  let fixture: ComponentFixture<UnusedIpAddressAutoCompleteComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyRestFormControl: jasmine.Spy<any>;
  let spyFilterOptions: jasmine.Spy<any>;
  let spyFilter: jasmine.Spy<any>;

  // Test Data
  const form_control: FormControl = new FormControl('');

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule,
        TestingModule
      ],
      providers: [
        MipManagementComponent,
        NodeManagementComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnusedIpAddressAutoCompleteComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyRestFormControl = spyOn(component, 'reset_form_control').and.callThrough();
    spyFilterOptions = spyOn<any>(component, 'filter_options_').and.callThrough();
    spyFilter = spyOn<any>(component, 'filter_').and.callThrough();

    component.form_control = form_control;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyNGOnInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyRestFormControl.calls.reset();
    spyFilterOptions.calls.reset();
    spyFilter.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create UnusedIpAddressAutoCompleteComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('UnusedIpAddressAutoCompleteComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call get_classes()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call filter_options_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['filter_options_']).toHaveBeenCalled();
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange([], MockUnusedIpAddresses, true);
        simple_changes['options'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call filter_options_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange([], MockUnusedIpAddresses, true);
        simple_changes['options'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['filter_options_']).toHaveBeenCalled();
      });

      it('should not call filter_options_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(MockUnusedIpAddresses, MockUnusedIpAddresses, false);
        simple_changes['options'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['filter_options_']).not.toHaveBeenCalled();
      });
    });

    describe('reset_form_control()', () => {
      it('should call reset_form_control()', () => {
        reset();

        component.reset_form_control(true);

        expect(component.reset_form_control).toHaveBeenCalled();
      });

      it('should call reset_form_control() and reset the form control with empty string when event true passed in', () => {
        reset();

        component.form_control.setValue('192.168.1.1');
        component.reset_form_control(true);

        expect(component.form_control.value).toEqual('');
      });

      it('should call reset_form_control() and not reset the form control with empty string when event false passed in', () => {
        reset();

        component.form_control.setValue('192.168.1.1');
        component.reset_form_control(false);

        expect(component.form_control.value).toEqual('192.168.1.1');
      });
    });

    describe('private filter_options_()', () => {
      it('should call filter_options_()', () => {
        reset();

        component.options = MockUnusedIpAddresses;
        component['filter_options_']();

        expect(component['filter_options_']).toHaveBeenCalled();
      });

      it('should call filter_options_() and set filtered_options = starting value', () => {
        reset();

        component.options = MockUnusedIpAddresses;
        component['filter_options_']();

        component.filtered_options
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: string[]) => {
            expect(response).toEqual(component.options);
          });
      });
    });

    describe('private filter_options_()', () => {
      it('should call filter_()', () => {
        reset();

        component.options = MockUnusedIpAddresses;
        component['filter_'](undefined);

        expect(component['filter_']).toHaveBeenCalled();
      });

      it('should call filter_() and return options', () => {
        reset();

        component.options = MockUnusedIpAddresses;
        const return_value: string[] = component['filter_'](undefined);

        expect(return_value).toEqual(component.options);
      });

      it('should call filter_() and return filtered options', () => {
        reset();

        component.options = MockUnusedIpAddresses;
        const return_value: string[] = component['filter_'](component.options[0]);

        expect(return_value.length < component.options.length).toBeTrue();
      });
    });
  });
});
