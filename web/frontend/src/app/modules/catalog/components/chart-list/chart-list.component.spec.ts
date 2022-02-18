import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { CatalogModule } from '../../catalog.module';
import { ChartListComponent } from './chart-list.component';

describe('ChartListComponent', () => {
  let component: ChartListComponent;
  let fixture: ComponentFixture<ChartListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CatalogModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartListComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => remove_styles_from_dom());

  it('should create ChartListComponent', () => {
    expect(component).toBeTruthy();
  });
});
