import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  MockChartClassArkime,
  MockChartClassRedmine,
  MockChartClassSuricata,
  MockChartClassWikiJs,
  MockChartClassZeek,
  MockChartClassZeekFailed,
  MockChartClassZeekUninstalling,
  MockStatusClassArkimeViewerFailed,
  MockStatusClassArkimeViewerPendingInstall,
  MockStatusClassArkimeViewerUninstalled,
  MockStatusClassArkimeViewerUninstalling,
  MockStatusClassLogstashDeployed,
  MockStatusClassLogstashDeployedError
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { CatalogModule } from '../../catalog.module';
import { GREEN, RED, WHITE, YELLOW } from '../../constants/catalog.constants';
import { ApplicationCardComponent } from './application-card.component';

describe('ApplicationCardComponent', () => {
  let component: ApplicationCardComponent;
  let fixture: ComponentFixture<ApplicationCardComponent>;
  let router: Router;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyGenerateUniqueHTMLId: jasmine.Spy<any>;
  let spyMouseenterHoverCard: jasmine.Spy<any>;
  let spyMouseleaveHoverCard: jasmine.Spy<any>;
  let spyGetBackgroundColor: jasmine.Spy<any>;
  let spyGetStatusColor: jasmine.Spy<any>;
  let spyIsDiabled: jasmine.Spy<any>;
  let spyCardSelect: jasmine.Spy<any>;

  // Router Spy
  let spyRouter: jasmine.Spy<any>;

  // Test Data
  const passed_id: string = 'passed_id';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        CatalogModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyGenerateUniqueHTMLId = spyOn(component, 'generate_unique_html_id').and.callThrough();
    spyMouseenterHoverCard = spyOn(component, 'mouseenter_hover_card').and.callThrough();
    spyMouseleaveHoverCard = spyOn(component, 'mouseleave_hover_card').and.callThrough();
    spyGetBackgroundColor = spyOn(component, 'get_background_color').and.callThrough();
    spyGetStatusColor = spyOn(component, 'get_status_color').and.callThrough();
    spyIsDiabled = spyOn(component, 'is_disabled').and.callThrough();
    spyCardSelect = spyOn(component, 'card_select').and.callThrough();

    // Router spy
    spyRouter = spyOn(router, 'navigate');

    // Set Test Data
    component.chart = MockChartClassArkime;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyGenerateUniqueHTMLId.calls.reset();
    spyMouseenterHoverCard.calls.reset();
    spyMouseleaveHoverCard.calls.reset();
    spyGetBackgroundColor.calls.reset();
    spyGetStatusColor.calls.reset();
    spyIsDiabled.calls.reset();
    spyCardSelect.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ApplicationCardComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ApplicationCardComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call get_background_color() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.get_background_color).toHaveBeenCalled();
      });
    });

    describe('generate_unique_html_id()', () => {
      it('should call generate_unique_html_id()', () => {
        reset();

        component.generate_unique_html_id(passed_id);

        expect(component.generate_unique_html_id).toHaveBeenCalled();
      });

      it('should call generate_unique_html_id() and return string prepended with unique string', () => {
        reset();

        component.unique_html_id = 'test';
        const return_value: string = component.generate_unique_html_id(passed_id);

        expect(return_value).toEqual(`${component.unique_html_id}-${passed_id}`);
      });

      it('should call generate_unique_html_id() and return string not prepended with unique string', () => {
        reset();

        const return_value: string = component.generate_unique_html_id(passed_id);

        expect(return_value).toEqual(passed_id);
      });
    });

    describe('mouseenter_hover_card()', () => {
      it('should call mouseenter_hover_card()', () => {
        reset();

        component.mouseenter_hover_card();

        expect(component.mouseenter_hover_card).toHaveBeenCalled();
      });

      it('should call mouseenter_hover_card() and set hovered = true', () => {
        reset();

        component.hovered = false;

        expect(component.hovered).toBeFalse();

        component.mouseenter_hover_card();

        expect(component.hovered).toBeTrue();
      });
    });

    describe('mouseleave_hover_card()', () => {
      it('should call mouseleave_hover_card()', () => {
        reset();

        component.mouseleave_hover_card();

        expect(component.mouseleave_hover_card).toHaveBeenCalled();
      });

      it('should call mouseleave_hover_card() and set hovered = false', () => {
        reset();

        component.hovered = true;

        expect(component.hovered).toBeTrue();

        component.mouseleave_hover_card();

        expect(component.hovered).toBeFalse();
      });
    });

    describe('get_background_color()', () => {
      it('should call get_background_color()', () => {
        reset();

        component.get_background_color();

        expect(component.get_background_color).toHaveBeenCalled();
      });

      it('should call get_background_color() and return RED', () => {
        reset();

        component.chart = MockChartClassZeekFailed;
        const return_value: string = component.get_background_color();

        expect(return_value).toEqual(RED);
      });

      it('should call get_background_color() and return YELLOW', () => {
        reset();

        component.chart = MockChartClassZeekUninstalling;
        const return_value: string = component.get_background_color();

        expect(return_value).toEqual(YELLOW);
      });

      it('should call get_background_color() and return GREEN', () => {
        reset();

        component.chart = MockChartClassZeek;
        const return_value: string = component.get_background_color();

        expect(return_value).toEqual(GREEN);
      });

      it('should call get_background_color() and return WHITE', () => {
        reset();

        component.chart = MockChartClassRedmine;
        const return_value: string = component.get_background_color();

        expect(return_value).toEqual(WHITE);
      });
    });

    describe('get_status_color()', () => {
      it('should call get_status_color()', () => {
        reset();

        component.get_status_color(MockStatusClassLogstashDeployed);

        expect(component.get_status_color).toHaveBeenCalled();
      });

      it('should call get_status_color() and return GREEN deployed from COLORS_DICT', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassLogstashDeployed);

        expect(return_value).toEqual(GREEN);
      });

      it('should call get_status_color() and return YELLOW pending install from COLORS_DICT', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassArkimeViewerPendingInstall);

        expect(return_value).toEqual(YELLOW);
      });

      it('should call get_status_color() and return YELLOW uninstalling from COLORS_DICT', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassArkimeViewerUninstalling);

        expect(return_value).toEqual(YELLOW);
      });

      it('should call get_status_color() and return RED uninstalled from COLORS_DICT', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassArkimeViewerUninstalled);

        expect(return_value).toEqual(RED);
      });

      it('should call get_status_color() and return RED failed from COLORS_DICT', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassArkimeViewerFailed);

        expect(return_value).toEqual(RED);
      });

      it('should call get_status_color() and return WHITE', () => {
        reset();

        const return_value: string = component.get_status_color(MockStatusClassLogstashDeployedError);

        expect(return_value).toEqual(WHITE);
      });
    });

    describe('is_disabled()', () => {
      it('should call is_disabled()', () => {
        reset();

        component.is_disabled(MockChartClassWikiJs);

        expect(component.is_disabled).toHaveBeenCalled();
      });

      it('should call is_disabled() and return true for SURICATA application', () => {
        reset();

        component.rule_sync = true;
        const return_value: boolean = component.is_disabled(MockChartClassSuricata);

        expect(return_value).toBeTrue();
      });

      it('should call is_disabled() and return true for ZEEK application', () => {
        reset();

        component.rule_sync = true;
        const return_value: boolean = component.is_disabled(MockChartClassZeek);

        expect(return_value).toBeTrue();
      });

      it('should call is_disabled() and return false for SURICATA application', () => {
        reset();

        component.rule_sync = false;
        const return_value: boolean = component.is_disabled(MockChartClassSuricata);

        expect(return_value).toBeFalse();
      });

      it('should call is_disabled() and return false for ZEEK application', () => {
        reset();

        component.rule_sync = false;
        const return_value: boolean = component.is_disabled(MockChartClassZeek);

        expect(return_value).toBeFalse();
      });
    });

    describe('card_select()', () => {
      it('should call card_select()', () => {
        reset();

        component.card_select(MockChartClassArkime);

        expect(component.card_select).toHaveBeenCalled();
      });

      it('should call router_.navigate() from card_select()', () => {
        reset();

        component.card_select(MockChartClassArkime);

        expect(spyRouter).toHaveBeenCalledWith([`/application/${component.chart.application}`]);
      });
    });
  });
});
