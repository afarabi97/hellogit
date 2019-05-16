import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentInstallerAddDialogComponent } from './agent-installer-add-dialog.component';

describe('AgentInstallerAddDialogComponent', () => {
  let component: AgentInstallerAddDialogComponent;
  let fixture: ComponentFixture<AgentInstallerAddDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentInstallerAddDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentInstallerAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
