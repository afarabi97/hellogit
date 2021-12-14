import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { PasswordMessageComponent } from './password-message.component';

describe('PasswordMessageComponent', () => {
  let component: PasswordMessageComponent;
  let fixture: ComponentFixture<PasswordMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PasswordMessageComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordMessageComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => remove_styles_from_dom());

  it('should create PasswordMessageComponent', () => {
    expect(component).toBeTruthy();
  });
});
