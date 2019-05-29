import { TestBed } from '@angular/core/testing';

import { AgentInstallerService } from './agent-installer.service';

describe('AgentInstallerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AgentInstallerService = TestBed.get(AgentInstallerService);
    expect(service).toBeTruthy();
  });
});
