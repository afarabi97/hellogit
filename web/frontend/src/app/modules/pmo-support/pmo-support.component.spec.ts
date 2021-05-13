import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { MockSystemVersionClass } from '../../../../static-data/class-objects-v3_4';
import { TestingModule } from '../testing-modules/testing.module';
import { PmoSupportComponent } from './pmo-support.component';
import { PmoSupportModule } from './pmo-support.module';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('PmoSupportComponent', () => {
  let component: PmoSupportComponent;
  let fixture: ComponentFixture<PmoSupportComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyApiGetSystemVersion: jasmine.Spy<any>;

  // Test Data
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PmoSupportModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmoSupportComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyApiGetSystemVersion = spyOn<any>(component, 'api_get_system_version_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyApiGetSystemVersion.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PmoSupportComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PmoSupportComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_system_version_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_system_version_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_system_version_()', () => {
      it('should call api_get_system_version_()', () => {
        reset();

        component['api_get_system_version_']();

        expect(component['api_get_system_version_']).toHaveBeenCalled();
      });

      it('should call api_get_system_version_() and set component.system_version', () => {
        reset();

        component['api_get_system_version_']();

        expect(component.system_version).toEqual(MockSystemVersionClass);
      });

      it('should call system_version_service_.get_system_version() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['system_version_service_'], 'get_system_version').and.returnValue(throwError(mock_http_error_response));

        component['api_get_system_version_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
