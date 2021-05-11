import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockUserPortalLinkClass } from '../../../../static-data/class-objects-v3_7';
import { MockUserPortalLinkInterface } from '../../../../static-data/interface-objects-v3_7';
import { UserPortalLinkClass } from '../../classes';
import { CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { UserPortalLinkInterface } from '../../interfaces';
import { TestingModule } from '../testing-modules/testing.module';
import { PortalComponent } from './portal.component';
import { PortalModule } from './portal.module';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('PortalComponent', () => {
  let component: PortalComponent;
  let fixture: ComponentFixture<PortalComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenAddUserPortalLink: jasmine.Spy<any>;
  let spyOpenConfirmRemoveUserPortalLink: jasmine.Spy<any>;
  let spyGoToUrl: jasmine.Spy<any>;
  let spyApiGetPortalLInks: jasmine.Spy<any>;
  let spyApiGetUserPortalLinks: jasmine.Spy<any>;
  let spyApiAddUserPortalLink: jasmine.Spy<any>;
  let spyApiRemoveUserPortal: jasmine.Spy<any>;

  // Test Data
  const user_portal_link_form_group: FormGroup = new FormGroup({});
  Object.keys(MockUserPortalLinkInterface).forEach((key: string) => {
    user_portal_link_form_group.addControl(key, new FormControl(MockUserPortalLinkInterface[key]));
  });
  user_portal_link_form_group.markAllAsTouched();
  const mock_event: Event = new Event('Fake Event');
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PortalModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenAddUserPortalLink = spyOn(component, 'open_add_user_portal_link').and.callThrough();
    spyOpenConfirmRemoveUserPortalLink = spyOn(component, 'open_confirm_remove_user_portal_link').and.callThrough();
    spyGoToUrl = spyOn(component, 'go_to_url').and.callThrough();
    spyApiGetPortalLInks = spyOn<any>(component, 'api_get_portal_links_').and.callThrough();
    spyApiGetUserPortalLinks = spyOn<any>(component, 'api_get_user_portal_links_').and.callThrough();
    spyApiAddUserPortalLink = spyOn<any>(component, 'api_add_user_portal_link_').and.callThrough();
    spyApiRemoveUserPortal = spyOn<any>(component, 'api_remove_user_portal_link_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenAddUserPortalLink.calls.reset();
    spyOpenConfirmRemoveUserPortalLink.calls.reset();
    spyGoToUrl.calls.reset();
    spyApiGetPortalLInks.calls.reset();
    spyApiGetUserPortalLinks.calls.reset();
    spyApiAddUserPortalLink.calls.reset();
    spyApiRemoveUserPortal.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PortalComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PortalComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_portal_links_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_portal_links_']).toHaveBeenCalled();
      });

      it('should call api_get_user_portal_links_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_user_portal_links_']).toHaveBeenCalled();
      });
    });

    describe('open_add_user_portal_link()', () => {
      it('should call open_add_user_portal_link()', () => {
        reset();

        component.open_add_user_portal_link();

        expect(component.open_add_user_portal_link).toHaveBeenCalled();
      });

      it('should call api_add_user_portal_link_() after mat dialog ref closed from within open_add_user_portal_link()', () => {
        reset();

        // Add spy to return value from mat_dialog
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(user_portal_link_form_group) } as MatDialogRef<typeof component>);

        component.open_add_user_portal_link();

        expect(component['api_add_user_portal_link_']).toHaveBeenCalled();
      });
    });

    describe('open_confirm_remove_user_portal_link()', () => {
      it('should call open_confirm_remove_user_portal_link()', () => {
        reset();

        component.open_confirm_remove_user_portal_link(mock_event, MockUserPortalLinkClass);

        expect(component.open_confirm_remove_user_portal_link).toHaveBeenCalled();
      });

      it('should call api_add_user_portal_link_() after mat dialog ref closed from within open_confirm_remove_user_portal_link()', () => {
        reset();

        // Add spy to return value from mat_dialog
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.open_confirm_remove_user_portal_link(mock_event, MockUserPortalLinkClass);

        expect(component['api_remove_user_portal_link_']).toHaveBeenCalled();
      });
    });

    describe('go_to_url()', () => {
      it('should call go_to_url()', () => {
        reset();

        component.go_to_url('');

        expect(component.go_to_url).toHaveBeenCalled();
      });
    });

    describe('private api_get_portal_links_()', () => {
      it('should call api_get_portal_links_()', () => {
        reset();

        component['api_get_portal_links_']();

        expect(component['api_get_portal_links_']).toHaveBeenCalled();
      });

      it('should call api_get_portal_links_() and set portal_links', () => {
        reset();

        component.portal_links = [];

        expect(component.portal_links.length > 0).toBeFalse();

        component['api_get_portal_links_']();

        expect(component.portal_links.length > 0).toBeTrue();
      });
    });

    describe('private api_get_user_portal_links_()', () => {
      it('should call api_get_user_portal_links_()', () => {
        reset();

        component['api_get_user_portal_links_']();

        expect(component['api_get_user_portal_links_']).toHaveBeenCalled();
      });

      it('should call api_get_user_portal_links_() and set user_portal_links', () => {
        reset();

        component.user_portal_links = [];

        expect(component.user_portal_links.length > 0).toBeFalse();

        component['api_get_user_portal_links_']();

        expect(component.user_portal_links.length > 0).toBeTrue();
      });
    });

    describe('private api_add_user_portal_link_()', () => {
      it('should call api_add_user_portal_link_()', () => {
        reset();

        component['api_add_user_portal_link_'](MockUserPortalLinkClass);

        expect(component['api_add_user_portal_link_']).toHaveBeenCalled();
      });

      it('should call api_add_user_portal_link_() and set user_portal_links with included add user portal', () => {
        reset();

        component.user_portal_links = [];

        expect(component.user_portal_links.length > 0).toBeFalse();

        component['api_add_user_portal_link_'](MockUserPortalLinkClass);

        const user_portal_links_filtered: UserPortalLinkInterface[] = component.user_portal_links.filter((u: UserPortalLinkClass) => u._id !== MockUserPortalLinkClass._id);

        expect(user_portal_links_filtered.length > 0).toBeTrue();
      });

      it('should call portal_service_.add_user_link() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['portal_service_'], 'add_user_link').and.returnValue(throwError(mock_http_error_response));

        component['api_add_user_portal_link_'](MockUserPortalLinkClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_remove_user_portal_link_()', () => {
      it('should call api_remove_user_portal_link_()', () => {
        reset();

        component['api_remove_user_portal_link_'](MockUserPortalLinkClass);

        expect(component['api_remove_user_portal_link_']).toHaveBeenCalled();
      });

      it('should call api_remove_user_portal_link_() and set user_portal_links with included add user portal', () => {
        reset();

        component.user_portal_links = [MockUserPortalLinkClass];

        expect(component.user_portal_links.length > 0).toBeTrue();

        component['api_remove_user_portal_link_'](MockUserPortalLinkClass);

        expect(component.user_portal_links.length > 0).toBeFalse();
      });

      it('should call portal_service_.remove_user_link() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['portal_service_'], 'remove_user_link').and.returnValue(throwError(mock_http_error_response));

        component['api_remove_user_portal_link_'](MockUserPortalLinkClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
