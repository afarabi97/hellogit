import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Subject, of  } from 'rxjs';

import { PasswordMessageComponent } from './password-message.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(null)
    };
  }
  closeAll() {
    return {
      afterClosed: () => of(null)
    };
  }
}

describe('PasswordMessageComponent', () => {
  let component: PasswordMessageComponent;
  let fixture: ComponentFixture<PasswordMessageComponent>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PasswordMessageComponent
      ],
      providers: [
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordMessageComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {

  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PasswordMessageComponent', () => {
    expect(component).toBeTruthy();
  });
});
