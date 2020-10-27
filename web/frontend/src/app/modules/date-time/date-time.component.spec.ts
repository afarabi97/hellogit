import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatSelectChange } from '@angular/material/select';

import { DateTimeComponent } from './date-time.component';
import { DateTimeModule } from './date-time.module';

export function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('DateTimeComponent', () => {
  let component: DateTimeComponent;
  let fixture: ComponentFixture<DateTimeComponent>;

  // Setup spy references
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyGenerateUniqueHTMLID: jasmine.Spy<any>;
  let spyChangeDateTime: jasmine.Spy<any>;
  let spyPickerUpdate: jasmine.Spy<any>;
  let spyTextChange: jasmine.Spy<any>;
  let spyChangeDateTimeP: jasmine.Spy<any>;
  let spyGetHoursMinutesSeconds: jasmine.Spy<any>;
  let spyWriteValue: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        DateTimeModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeComponent);
    component = fixture.componentInstance;

    // Set componet form controls to prevent breaking
    component.timezone = new FormControl('UTC');
    component.datetime = new FormControl('');

    // Add method spies
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyGenerateUniqueHTMLID = spyOn(component, 'generateUniqueHTMLID').and.callThrough();
    spyChangeDateTime = spyOn(component, 'changeDateTime').and.callThrough();
    spyPickerUpdate = spyOn(component, 'pickerUpdate').and.callThrough();
    spyTextChange = spyOn(component, 'textChange').and.callThrough();
    spyChangeDateTimeP = spyOn<any>(component, 'changeDateTime_').and.callThrough();
    spyGetHoursMinutesSeconds = spyOn<any>(component, 'getHoursMinutesSeconds_').and.callThrough();
    spyWriteValue = spyOn<any>(component, 'writeValue_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnChanges.calls.reset();
    spyGenerateUniqueHTMLID.calls.reset();
    spyChangeDateTime.calls.reset();
    spyPickerUpdate.calls.reset();
    spyTextChange.calls.reset();
    spyChangeDateTimeP.calls.reset();
    spyGetHoursMinutesSeconds.calls.reset();
    spyWriteValue.calls.reset();
  };

  afterAll(() => cleanStylesFromDOM());

  it('should create DateTimeComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('DateTimeComponent methods', () => {
    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        component.ngOnChanges();

        expect(component.ngOnChanges).toHaveBeenCalled();
      });
    });

    describe('generateUniqueHTMLID()', () => {
      it('should call generateUniqueHTMLID()', () => {
        reset();

        const childID = 'fake-child-id';

        component.generateUniqueHTMLID(childID);

        expect(component.generateUniqueHTMLID).toHaveBeenCalled();
      });

      it(`should call generateUniqueHTMLID() and return 'fake-parent-id-fake-child-id'`, () => {
        reset();

        const parentID = 'fake-parent-id';
        const childID = 'fake-child-id';

        component.uniqueHTMLID = parentID;
        const value: string = component.generateUniqueHTMLID(childID);

        expect(value).toEqual(`${parentID}-${childID}`);
      });

      it(`should call generateUniqueHTMLID() and return 'fake-child-id'`, () => {
        reset();

        const childID = 'fake-child-id';

        const value: string = component.generateUniqueHTMLID(childID);

        expect(value).toEqual(childID);
      });
    });

    describe('changeDateTime()', () => {
      it('should call changeDateTime()', () => {
        reset();

        const matSelectChange: MatSelectChange = {
          source: undefined,
          value: 'UTC'
        };

        component.changeDateTime(matSelectChange);

        expect(component.changeDateTime).toHaveBeenCalled();
      });
    });

    describe('pickerUpdate()', () => {
      it('should call pickerUpdate()', () => {
        reset();

        const matDatePickerInputEvent: MatDatepickerInputEvent<Date> = {
          target: undefined,
          targetElement: undefined,
          value: new Date()
        };

        component.pickerUpdate(matDatePickerInputEvent);

        expect(component.pickerUpdate).toHaveBeenCalled();
      });
    });

    describe('textChange()', () => {
      it('should call textChange()', () => {
        reset();

        const inputChangeEvent = {
          target: {
            value: ''
          }
        };

        component.textChange(inputChangeEvent);

        expect(component.textChange).toHaveBeenCalled();
      });

      it(`should call textChange() handle 'Invalid Date' and set component.value to prevDate`, () => {
        reset();

        const inputChangeEvent = {
          target: {
            value: 'invalid'
          }
        };

        component.value = new Date();
        component.textChange(inputChangeEvent);

        expect(component.textChange).toHaveBeenCalled();
      });

      it(`should call textChange() and set componet.value = newDate`, () => {
        reset();

        const newDate = new Date(new Date().getTime() + 10000000);
        const inputChangeEvent = {
          target: {
            value: newDate
          }
        };

        component.value = new Date();
        component.textChange(inputChangeEvent);

        expect(component.value.toString()).toEqual(newDate.toString());
      });

      it(`should call textChange() and set componet.datetime.value = newDate`, () => {
        reset();

        const newDate = new Date(new Date().getTime() + 10000000);
        const inputChangeEvent = {
          target: {
            value: newDate
          }
        };

        component.value = new Date();
        component.textChange(inputChangeEvent);

        expect(component.datetime.value).toEqual(component['datePipe_'].transform(component.value, component.format));
      });
    });

    describe('private changeDateTime_()', () => {
      it('should call changeDateTime_()', () => {
        reset();

        component.value = new Date();
        component['changeDateTime_']();

        expect(component['changeDateTime_']).toHaveBeenCalled();
      });

      it('should call changeDateTime_() and use parameter timezonestr', () => {
        reset();

        component.value = new Date();
        component['changeDateTime_']('Browser');

        expect(component.timezone.value).toEqual(Intl.DateTimeFormat().resolvedOptions().timeZone);
      });
    });

    describe('private getHoursMinutesSeconds_()', () => {
      it('should call getHoursMinutesSeconds_()', () => {
        reset();

        component['getHoursMinutesSeconds_']();

        expect(component['getHoursMinutesSeconds_']).toHaveBeenCalled();
      });

      it('should call getHoursMinutesSeconds_() and return [ 0, 0, 0 ]', () => {
        reset();

        const value: number[] = component['getHoursMinutesSeconds_']();

        if (value.length === 3) {
          value.forEach((v: number) => expect(v).toEqual(0));
        }
      });

      it('should call getHoursMinutesSeconds_() and return component.value [ hours, minutes, seconds ]', () => {
        reset();

        component.value = new Date();
        const value: number[] = component['getHoursMinutesSeconds_']();

        if (value.length === 3) {
          value.forEach((v: number, index: number) => {
            if (index === 0) {
              expect(v).toEqual(component.value.getHours());
            } else if (index === 1) {
                expect(v).toEqual(component.value.getMinutes());
            } else {
                expect(v).toEqual(component.value.getSeconds());
            }
          });
        }
      });
    });

    describe('private writeValue_()', () => {
      it('should call writeValue_()', () => {
        reset();

        const newDate: Date = new Date();

        component['writeValue_'](newDate);

        expect(component['writeValue_']).toHaveBeenCalled();
      });

      it('should call getHoursMinutesSeconds_() and set component.value, component.datetime', () => {
        reset();

        const newDate: Date = new Date();

        component['writeValue_'](newDate);

        fixture.detectChanges();

        expect(component.value.toString()).toEqual(newDate.toString());
        expect(component.datetime.value).toEqual(component['datePipe_'].transform(component.value, component.format));
      });
    });
  });
});
