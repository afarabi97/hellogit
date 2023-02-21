import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MockNodeServerClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../testing-modules/testing.module';
import { GlobalComponentsModule } from '../../global-components.module';
import { NodeInfoDialogComponent } from './node-info-dialog.component';

describe('NodeInfoDialogComponent', () => {
  let component: NodeInfoDialogComponent;
  let fixture: ComponentFixture<NodeInfoDialogComponent>;

  // Setup spy references
  let spyClose: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MockNodeServerClass }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeInfoDialogComponent);
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

  it('should create NodeInfoDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NodeInfoDialogComponent methods', () => {
    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });
  });
});
