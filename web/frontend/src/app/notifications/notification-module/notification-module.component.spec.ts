import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationsModuleComponent } from './notifications-module.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { WebsocketService } from '../../services/websocket.service';
import { NotificationService } from '../services/notification.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';


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
        { provide: NotificationService, useValue: null}
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
  
  // it('should display a list of clickable items', () => {
  //   let message1 = createNotification('2020-03-11T01:26:16.203898', 'catalog', 'Installing Cortex on server', 'Installing', 'Cortex', 'IN_PROGRESS', '');
  //   let buttonList: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [message1], "icon": "dashboard"}];


  //   component.buttonList = buttonList;

  //   fixture.detectChanges();
  //   let innercard = fixture.debugElement.queryAll(By.css('.messageCenter__center__outerCard__innerCard__left'));
  //   expect(innercard.length).toEqual(1);

  
  // });
 
  // it('should be able to delete notifications',async( () => {
  //   let message1 = createNotification('1', 'message', '', '', '', 'COMPLETED', '');
  //   let buttonList: any = [{"name": "All", "selected": true, "title": "All Messages","role": "all", "notifications": [], "icon": "dashboard"}];
  //   service.buttonList[0]=buttonList[0]
  //   console.log(service.urlPath);
  //   component.clearNotification('1');
  //   let var1 = del.expectOne('/api/notifications/1');
  //   var1.flush({})
  //   del.verify();
  // }));
   

});

function createNotification (timestamp, role, message, action, application, status, exception) {
  return {"timestamp": timestamp, "role": role, "message": message, "action": action, "application": application, "status": status, "exception": exception}
}

                           