import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';

import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { WebsocketService } from '../../services/websocket.service';
import { UserService } from '../../user.service';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { NotificationService } from '../services/notification.service';
import { NotificationsModuleComponent } from './notifications-module.component';

@Injectable()
class UserServiceSpy {

  isControllerMaintainer() {
      return true;
  }
}

describe('NotificationsModuleComponent', () => {

  let component: NotificationsModuleComponent;
  let fixture: ComponentFixture<NotificationsModuleComponent>;
  let notificationService: NotificationService;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsModuleComponent],
      providers: [
        { provide: WebsocketService, useValue: null},
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialog, useValue: null },
        { provide: MatDialogRef, useValue: null },
        { provide: MatSnackBar, useValue: null },
        { provide: SnackbarWrapper, useValue: null},
        { provide: NotificationService, useValue: null},
        { provide: UserService, useClass: UserServiceSpy }
      ],
      imports: [ HttpClientTestingModule, MatButtonModule, InjectorModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsModuleComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.get(NotificationService);
    // spyOn(notificationService, 'handleSuccess')
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be able to create the component truthy', () => {
    expect(component).toBeTruthy();
  });
});

function createNotification (timestamp, role, message, action, application, status, exception) {
  return {"timestamp": timestamp, "role": role, "message": message, "action": action, "application": application, "status": status, "exception": exception}
}