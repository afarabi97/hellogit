import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpTargetListDialogComponent } from './ip-target-list-dialog.component';

describe('IpTargetListDialogComponent', () => {
  let component: IpTargetListDialogComponent;
  let fixture: ComponentFixture<IpTargetListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpTargetListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpTargetListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
