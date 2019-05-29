import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentInstallerComponent } from './agent-installer.component';

describe('AgentInstallerComponent', () => {
  let component: AgentInstallerComponent;
  let fixture: ComponentFixture<AgentInstallerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentInstallerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentInstallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
