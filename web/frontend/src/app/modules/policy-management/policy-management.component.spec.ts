import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { PolicyManagementComponent } from './policy-management.component';
import { PolicyManagementModule } from './policy-management.module';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('PolicyManagementComponent', () => {
  let component: PolicyManagementComponent;
  let fixture: ComponentFixture<PolicyManagementComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spySetUserEditing: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        PolicyManagementModule,
        TestingModule
      ],
      providers: [
        Title
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyManagementComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spySetUserEditing = spyOn<any>(component, 'set_user_editing_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spySetUserEditing.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PolicyManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PolicyManagementComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call rules_service_.get_is_user_editing() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['rules_service_'].get_is_user_editing).toHaveBeenCalled();
      });

      it('should call set_user_editing_() from rules_service_.get_is_user_editing()', () => {
        reset();

        component.ngOnInit();

        expect(component['set_user_editing_']).toHaveBeenCalled();
      });
    });

    describe('private set_user_editing_()', () => {
      it('should call set_user_editing_()', () => {
        reset();

        component['set_user_editing_'](true);

        expect(component['set_user_editing_']).toHaveBeenCalled();
      });

      it('should call set_user_editing_() and set user_editing to passed value', () => {
        reset();

        expect(component.user_editing).toBeFalse();

        component['set_user_editing_'](true);

        expect(component.user_editing).toBeTrue();
      });
    });
  });
});
