import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBuilderComponent } from './agent-builder.component';

describe('AgentBuilderComponent', () => {
  let component: AgentBuilderComponent;
  let fixture: ComponentFixture<AgentBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
