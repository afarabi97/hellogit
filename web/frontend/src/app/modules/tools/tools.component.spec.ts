import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { ToolsFormComponent } from './tools.component';
import { ToolsModule } from './tools.module';

describe('ToolsFormComponent', () => {
  let component: ToolsFormComponent;
  let fixture: ComponentFixture<ToolsFormComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ToolsModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ToolsFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ToolsFormComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });
    });
  });
});
