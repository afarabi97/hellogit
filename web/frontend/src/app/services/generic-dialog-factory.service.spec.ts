import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { of } from 'rxjs';

import { DialogDataInterface } from '../interfaces';
import { GenericDialogFactoryService } from './generic-dialog-factory.service';
import { GenericDialogService } from './helpers/generic-dialog.service';

@Component({
  template: `
    <ng-template #fakeTemplateRef></ng-template>
  `,
})
class WrapperComponent {
  @ViewChild('fakeTemplateRef') fake_template_ref: TemplateRef<any>;
}

class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(null),
      afterOpened: () => of(null)
    };
  }
  closeAll() {
    return {
      afterClosed: () => of(null)
    };
  }
}

describe('GenericDialogFactoryService', () => {
  let service: GenericDialogFactoryService;

  // Setup spy references
  let spyOpen: jasmine.Spy<any>;

  // Test Data
  const data: string[] = [ 'fake', 'strings', 'for', 'test' ];
  let dialog_data: DialogDataInterface<any>;
  let mat_dialog_config: MatDialogConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        WrapperComponent
      ],
      providers: [
        GenericDialogFactoryService,
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    });

    service = TestBed.inject(GenericDialogFactoryService);

    // Add method spies
    spyOpen = spyOn(service, 'open').and.callThrough();

    // Set Test Data
    const fixture = TestBed.createComponent(WrapperComponent);
    const wrapper_component = fixture.debugElement.componentInstance;
    const fake_template_ref = wrapper_component.fake_template_ref;
    dialog_data = {
      title: 'Fake Dialog Title',
      template: fake_template_ref
    };
    mat_dialog_config = {
      width: '50vw',
      height: '50vh',
      panelClass: 'mat-dialog-container-override',
      data: data
    };
  });

  const reset = () => {

    spyOpen.calls.reset();
  };

  it('should create GenericDialogFactoryService', () => {
    expect(service).toBeTruthy();
  });

  describe('GenericDialogFactoryService methods', () => {
    describe('open()', () => {
      it('should call open()', () => {
        reset();

        service.open(dialog_data, mat_dialog_config);

        expect(service.open).toHaveBeenCalled();
      });

      it('should call open() and return GenericDialogService', () => {
        reset();

        const return_value: GenericDialogService = service.open(dialog_data, mat_dialog_config);

        expect(return_value instanceof GenericDialogService).toBeTrue();
      });
    });
  });
});
