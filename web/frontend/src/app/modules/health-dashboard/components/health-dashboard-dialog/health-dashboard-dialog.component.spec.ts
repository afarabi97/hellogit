import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockHealthDashboardDialogDataInterface } from '../../../../../../static-data/interface-objects';
import { HealthDashboardModule } from '../../health-dashboard.module';
import { HealthDashboardDialogComponent } from './health-dashboard-dialog.component';

describe('HealthDashboardDialogComponent', () => {
  let component: HealthDashboardDialogComponent;
  let fixture: ComponentFixture<HealthDashboardDialogComponent>;

  // Setup spy references
  let spyClose: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HealthDashboardModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MockHealthDashboardDialogDataInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthDashboardDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyClose = spyOn(component, 'close').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyClose.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create HealthDashboardDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HealthDashboardDialogComponent methods', () => {
    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });
  });
});
