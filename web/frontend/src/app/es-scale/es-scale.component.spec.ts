import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ESScaleComponent } from './es-scale.component';

describe('CatalogComponent', () => {
  let component: ESScaleComponent;
  let fixture: ComponentFixture<ESScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ESScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ESScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
