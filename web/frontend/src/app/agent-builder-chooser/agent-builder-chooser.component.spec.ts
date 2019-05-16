import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBuilderChooserComponent } from './agent-builder-chooser.component';

describe('AgentBuilderChooserComponent', () => {
  let component: AgentBuilderChooserComponent;
  let fixture: ComponentFixture<AgentBuilderChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentBuilderChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentBuilderChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
