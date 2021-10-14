import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';

import { DialogDataInterface } from '../../interfaces';
import { GenericDialogComponent } from '../../modules/generic-dialog/generic-dialog.component';
import { GenericDialogFactoryService } from '../generic-dialog-factory.service';
import { GenericDialogService } from './generic-dialog.service';

// Used for wrapper Component and for Tests
const FAKE_TITLE: string = 'Fake Title';
const FAKE_CONTEXT: any = { fake_context: 'fake_context' };
const DATA: string[] = [ 'fake', 'strings', 'for', 'test' ];

@Component({
  template: `
    <ng-template #fakeTemplateRef></ng-template>
    <ng-template #newFakeTemplateRef></ng-template>
  `,
})
class WrapperComponent {
  @ViewChild('fakeTemplateRef') fake_template_ref: TemplateRef<any>;
  @ViewChild('newFakeTemplateRef') new_fake_template_ref: TemplateRef<any>;

  constructor(private generic_dialog_factory_service_: GenericDialogFactoryService) {}

  open_notification_dialog_window(): GenericDialogService<undefined> {
    const dialog_data: DialogDataInterface<any> = {
      title: FAKE_TITLE,
      template: this.fake_template_ref,
      context: FAKE_CONTEXT
    };
    const mat_dialog_config: MatDialogConfig = {
      width: '50vw',
      height: '50vh',
      panelClass: 'mat-dialog-container-override',
      data: DATA
    };

    return this.generic_dialog_factory_service_.open(dialog_data, mat_dialog_config);
  }
}

class DialogMockReturnOpen {
  afterClosed: () => Observable<any>;
  afterOpened: () => Observable<any>;
  close: () => Observable<any>;

  constructor() {
    this.afterClosed = () => of(null);
    this.afterOpened = () => of(null);
    this.close = () => of(null);
  }
};

class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(null),
      afterOpened: () => of(null),
      close: () => of(null)
    };
  };
  closeAll() {
    return {
      afterClosed: () => of(null)
    };
  };
}

describe('GenericDialogService', () => {
  let service: GenericDialogService;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapper_component: WrapperComponent;
  let fake_template_ref: TemplateRef<any>;
  let new_fake_template_ref: TemplateRef<any>;
  let fixture_generic_dialog_component: ComponentFixture<GenericDialogComponent<undefined>>;
  let generic_dialog_component: GenericDialogComponent<undefined>;

  // Setup spy references
  let spyTitleGet: jasmine.Spy<any>;
  let spyTitleSet: jasmine.Spy<any>;
  let spyTemplateGet: jasmine.Spy<any>;
  let spyTemplateSet: jasmine.Spy<any>;
  let spyContextGet: jasmine.Spy<any>;
  let spyContextSet: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;

  // Test Data
  const data: string[] = [ 'fake', 'strings', 'for', 'test' ];
  const new_fake_title: string = 'New Fake Title';
  const new_fake_context = { fake_context: 'new_fake_context' };
  let dialog_data: DialogDataInterface<any> = {
    title: FAKE_TITLE,
    template: {} as TemplateRef<any>,
    context: FAKE_CONTEXT
  };
  let mat_dialog_config: MatDialogConfig;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      declarations: [
        WrapperComponent,
        GenericDialogComponent
      ],
      providers: [
        GenericDialogFactoryService,
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: dialog_data }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {

    // Set Test Data
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper_component = fixture.debugElement.componentInstance;
    fake_template_ref = wrapper_component.fake_template_ref;
    new_fake_template_ref = wrapper_component.new_fake_template_ref;
    fixture_generic_dialog_component = TestBed.createComponent(GenericDialogComponent);
    generic_dialog_component = fixture_generic_dialog_component.componentInstance;
    dialog_data = {
      title: FAKE_TITLE,
      template: fake_template_ref,
      context: FAKE_CONTEXT
    };
    mat_dialog_config = {
      width: '50vw',
      height: '50vh',
      panelClass: 'mat-dialog-container-override',
      data: data
    };
    const MatDialogRefOverride = {
      ...new DialogMockReturnOpen(),
      componentInstance: generic_dialog_component
    };

    // Need to override because data was not known before creation
    TestBed.overrideProvider(MatDialog, { useValue: MatDialogRefOverride });
    TestBed.overrideProvider(MatDialogRef, { useValue: MatDialogRefOverride });
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialog_data });
    spyOn(TestBed.inject(MatDialog), 'open').and.returnValue(MatDialogRefOverride as any);

    // Set Service
    service = wrapper_component.open_notification_dialog_window();

    // Add method spies and variable get / set spies
    spyTitleGet = spyOnProperty(service, 'title', 'get').and.callThrough();
    spyTitleSet = spyOnProperty(service, 'title', 'set').and.callThrough();
    spyTemplateGet = spyOnProperty(service, 'template', 'get').and.callThrough();
    spyTemplateSet = spyOnProperty(service, 'template', 'set').and.callThrough();
    spyContextGet = spyOnProperty(service, 'context', 'get').and.callThrough();
    spyContextSet = spyOnProperty(service, 'context', 'set').and.callThrough();
    spyClose = spyOn(service, 'close').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyTitleGet.calls.reset();
    spyTitleSet.calls.reset();
    spyTemplateGet.calls.reset();
    spyTemplateSet.calls.reset();
    spyContextGet.calls.reset();
    spyContextSet.calls.reset();
    spyClose.calls.reset();
  };

  it('should create GenericDialogService', () => {
    expect(service).toBeTruthy();
  });

  describe('GenericDialogService methods', () => {
    describe('get title', () => {
      it('should call get title', () => {
        reset();

        const return_value: string = service.title;

        expect(spyTitleGet).toHaveBeenCalled();
      });

      it('should call get title and return title', () => {
        reset();

        expect(service.title).toBe(FAKE_TITLE);
      });
    });

    describe('set title', () => {
      it('should call set title', () => {
        reset();

        service.title = new_fake_title;

        expect(spyTitleSet).toHaveBeenCalled();
      });

      it('should call set title and handle title set', () => {
        reset();

        service.title = new_fake_title;

        expect(service.title).toBe(new_fake_title);
      });
    });

    describe('get template', () => {
      it('should call get template', () => {
        reset();

        const return_value: TemplateRef<any> = service.template;

        expect(spyTemplateGet).toHaveBeenCalled();
      });

      it('should call get template and return template', () => {
        reset();

        expect(service.template).toBe(fake_template_ref);
      });
    });

    describe('set template', () => {
      it('should call set template', () => {
        reset();

        service.template = new_fake_template_ref;

        expect(spyTemplateSet).toHaveBeenCalled();
      });

      it('should call set template and handle template set', () => {
        reset();

        service.template = new_fake_template_ref;

        expect(service.template).toBe(new_fake_template_ref);
      });
    });

    describe('get context', () => {
      it('should call get context', () => {
        reset();

        const return_value: any = service.context;

        expect(spyContextGet).toHaveBeenCalled();
      });

      it('should call get context and return context', () => {
        reset();

        expect(service.context).toBe(FAKE_CONTEXT);
      });
    });

    describe('set context', () => {
      it('should call set context', () => {
        reset();

        service.context = new_fake_context;

        expect(spyContextSet).toHaveBeenCalled();
      });

      it('should call set context and handle context set', () => {
        reset();

        service.context = new_fake_context;

        expect(service.context).toBe(new_fake_context);
      });
    });

    describe('close()', () => {
      it('should call close()', () => {
        reset();

        service.close();

        expect(service.close).toHaveBeenCalled();
      });
    });
  });
});
