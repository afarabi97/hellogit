import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../modules/utilily-modules/material.module';
import { WebsocketService } from '../../services/websocket.service';
import { PolicyManagementService } from '../services/policy-management.service';
import { PolicyManagementTable } from './policy-management-table.component';

class MockSocket {
  getSocket() {
    return {'on': () => {}};
  }
}

describe('PolicyManagementTable', () => {
    let component: PolicyManagementTable;
    let fixture: ComponentFixture<PolicyManagementTable>;
    let httpTestingController: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [ PolicyManagementTable ],
    providers: [ PolicyManagementService, MatDialog, MatSnackBar, { provide: WebsocketService, useClass: MockSocket } ],
    imports: [ MaterialModule, HttpClientTestingModule, NoopAnimationsModule ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(PolicyManagementTable);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
    });
  });
