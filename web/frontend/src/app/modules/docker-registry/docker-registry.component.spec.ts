import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../testing-modules/testing.module';
import { DockerRegistryComponent } from './docker-registry.component';
import { DockerRegistryModule } from './docker-registry.module';

describe('DockerRegistryComponent', () => {
  let component: DockerRegistryComponent;
  let fixture: ComponentFixture<DockerRegistryComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyApiGetDockerRegistry: jasmine.Spy<any>;

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
        DockerRegistryModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DockerRegistryComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyApiGetDockerRegistry = spyOn<any>(component, 'api_get_docker_registry_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyApiGetDockerRegistry.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create DockerRegistryComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('DockerRegistryComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_docker_registry_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_docker_registry_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_docker_registry_()', () => {
      it('should call api_get_docker_registry_()', () => {
        reset();

        component['api_get_docker_registry_']();

        expect(component['api_get_docker_registry_']).toHaveBeenCalled();
      });

      it('should call api_remove_user_portal_link_() and set user_portal_links with included add user portal', () => {
        reset();

        component.registry = [];

        expect(component.registry.length > 0).toBeFalse();

        component['api_get_docker_registry_']();

        expect(component.registry.length > 0).toBeTrue();
      });

      it('should call docker_registry_service_.get_docker_registry() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['docker_registry_service_'], 'get_docker_registry').and.returnValue(throwError(mock_http_error_response));

        component['api_get_docker_registry_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
