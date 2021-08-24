import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PasswordMessageComponent } from './password-message.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

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

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PasswordMessageComponent', () => {
    expect(component).toBeTruthy();
  });
});
