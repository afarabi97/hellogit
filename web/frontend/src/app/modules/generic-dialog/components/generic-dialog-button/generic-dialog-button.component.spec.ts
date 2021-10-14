import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenericDialogModule } from '../../generic-dialog.module';
import { GenericButtonComponent } from './generic-dialog-button.component';

export function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('GenericButtonComponent', () => {
  let component: GenericButtonComponent;
  let fixture: ComponentFixture<GenericButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GenericDialogModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericButtonComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => cleanStylesFromDOM());

  it('should create GenericButtonComponent', () => {
    expect(component).toBeTruthy();
  });
});
