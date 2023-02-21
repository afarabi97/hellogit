import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import {
  MockAgentInstallerConfigurationClass1,
  MockAppConfigClass1,
  MockAppConfigClassesArray
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockElementSpecInterface1 } from '../../../../../../static-data/interface-objects';
import { TestingModule } from '../../../testing-modules/testing.module';
import { AgentBuilderChooserModule } from '../../agent-builder-chooser.module';
import { AgentDetailsDialogDataInterface } from '../../interfaces';
import { AgentDetailsDialogComponent } from './agent-details-dialog.component';

describe('AgentDetailsDialogComponent', () => {
  let component: AgentDetailsDialogComponent;
  let fixture: ComponentFixture<AgentDetailsDialogComponent>;

  // Setup spy references
  let spyGetElementConfig: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;

  // Test Data
  const MOCK_DIALOG_DATA__AGENT_DETAILS_DIALOG_DATA: AgentDetailsDialogDataInterface = {
    app_configs: MockAppConfigClassesArray,
    agent_installer_configuration: MockAgentInstallerConfigurationClass1
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AgentBuilderChooserModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA__AGENT_DETAILS_DIALOG_DATA }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentDetailsDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyGetElementConfig = spyOn(component, 'get_element_config').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyGetElementConfig.calls.reset();
    spyClose.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AgentDetailsDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AgentDetailsDialogComponent methods', () => {
    describe('get_element_config()', () => {
      it('should call get_element_config()', () => {
        reset();

        component.get_element_config(MockAppConfigClass1, MockElementSpecInterface1);

        expect(component.get_element_config).toHaveBeenCalled();
      });

      it('should call get_element_config() and return key value from end of chain', () => {
        reset();

        const return_value: any = component.get_element_config(MockAppConfigClass1, MockElementSpecInterface1);

        expect(return_value).toBeDefined();
      });
    });

    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });
  });
});
