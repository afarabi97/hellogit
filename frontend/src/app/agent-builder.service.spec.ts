import { TestBed } from '@angular/core/testing';

import { AgentBuilderService } from './agent-builder.service';

describe('AgentBuilderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgentBuilderService = TestBed.get(AgentBuilderService);
    expect(service).toBeTruthy();
  });
});
