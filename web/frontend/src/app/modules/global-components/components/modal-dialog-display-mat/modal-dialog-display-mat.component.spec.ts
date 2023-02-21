import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockMatDialogDataTitleInfoStringInterface } from '../../../../../../static-data/interface-objects';
import { GlobalComponentsModule } from '../../global-components.module';
import { ModalDialogDisplayMatComponent } from './modal-dialog-display-mat.component';

describe('ModalDialogDisplayMatComponent', () => {
  let component: ModalDialogDisplayMatComponent;
  let fixture: ComponentFixture<ModalDialogDisplayMatComponent>;

  // Setup spy references
  let spyClose: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MockMatDialogDataTitleInfoStringInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDialogDisplayMatComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyClose = spyOn(component, 'close').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyClose.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ModalDialogDisplayMatComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ModalDialogDisplayMatComponent methods', () => {
    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });
  });
});
