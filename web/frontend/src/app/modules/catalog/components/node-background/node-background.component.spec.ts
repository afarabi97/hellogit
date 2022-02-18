import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { CatalogModule } from '../../catalog.module';
import { NodeBackgroundComponent } from './node-background.component';

describe('NodeBackgroundComponent', () => {
  let component: NodeBackgroundComponent;
  let fixture: ComponentFixture<NodeBackgroundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CatalogModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeBackgroundComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => remove_styles_from_dom());

  it('should create NodeBackgroundComponent', () => {
    expect(component).toBeTruthy();
  });
});
