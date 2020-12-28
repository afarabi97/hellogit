import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MaterialModule } from '../../modules/utilily-modules/material.module';
import { WebsocketService } from '../../services/websocket.service';
import { RuleSet } from '../interface/ruleSet.interface';
import { PolicyManagementService } from '../services/policy-management.service';
import { PolicyManagementTable } from './policy-management-table.component';

const ALL_RULESETS = [
  {
    "_id": 73334,
    "appType": "Suricata",
    "clearance": "Unclassified",
    "createdDate": "2020-02-06 05:32:53",
    "groupName": "Threat Feeds",
    "isEnabled": false,
    "lastModifiedDate": "2020-02-27 00:11:41",
    "name": "Emerging Threats",
    "sensors": [],
    "state": "Dirty"
  },
  {
    "_id": 73337,
    "appType": "Suricata",
    "clearance": "Secret",
    "createdDate": "2020-02-26 14:31:18",
    "groupName": "test",
    "isEnabled": false,
    "lastModifiedDate": "2020-02-26 23:49:30",
    "name": "test",
    "sensors": [
      {
        "hostname": "acostatest3-sensor1.lan",
        "mac": "00:50:56:9d:79:28",
        "management_ip": "172.16.83.67"
      }
    ],
    "state": "Dirty"
  },
  {
    "_id": 73340,
    "appType": "Suricata",
    "clearance": "Unclassified",
    "createdDate": "2020-02-27 00:08:58",
    "groupName": "tes",
    "isEnabled": true,
    "lastModifiedDate": "2020-02-27 00:08:58",
    "name": "test1",
    "sensors": [
      {
        "hostname": "acostatest3-sensor1.lan",
        "mac": "00:50:56:9d:79:28",
        "management_ip": "172.16.83.67"
      }
    ],
    "state": "Created"
  }
];

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

    it('should be able to add new rule sets ', () => {

          const ruleSetGroup = new FormGroup({
            '_id': new FormControl('0'),
            'name': new FormControl(''),
            'clearance': new FormControl('secret'),
            'sensors': new FormControl('sensor1.lan'),
            'appType': new FormControl('Zeek'),
            'isEnabled': new FormControl(true),
            'groupName': new FormControl('test')
          });

          component.ruleSetsDataSource.data = ALL_RULESETS;

          spyOn(component.dialog as any, 'open').and.returnValue({afterClosed: () => of(ruleSetGroup)});

          component.addRuleSet();

          const additional = {
            "_id": 73343,
            "appType": "Suricata",
            "clearance": "Confidential",
            "createdDate": "2020-02-27 02:00:23",
            "groupName": "dgdf",
            "isEnabled": true,
            "lastModifiedDate": "2020-02-27 02:00:23",
            "name": "test",
            "rules": [],
            "sensors": [
              {
                "hostname": "acostatest3-sensor1.lan",
                "mac": "00:50:56:9d:79:28",
                "management_ip": "172.16.83.67"
              }
            ],
            "state": "Created"
          }

          const req = httpTestingController.expectOne('/api/ruleset');
          req.flush(additional);
          expect(req.request.body).toEqual(<RuleSet> ruleSetGroup.value);
          const XHRUrl = httpTestingController.expectOne('/api/ruleset');
          XHRUrl.flush(ALL_RULESETS);
          httpTestingController.verify();

          let length = component.ruleSetsDataSource.data.length;

          expect(component.ruleSetsDataSource.data[length - 1]).toEqual(new RuleSet(additional));

    });

    it('shuld be able to delete a ruleset', waitForAsync(() => {
      fixture.detectChanges();

      // const data1 = [{"_id":73334,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-06 05:32:53","groupName":"Threat Feeds","isEnabled":false,"lastModifiedDate":"2020-02-27 00:11:41","name":"Emerging Threats","sensors":[],"state":"Dirty"},{"_id":73346,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-28 02:56:45","groupName":"Bugs","isEnabled":true,"lastModifiedDate":"2020-02-28 02:56:45","name":"Bug Hunter 5000","sensors":[{"hostname":"acostatest3-sensor1.lan","mac":"00:50:56:9d:79:28","management_ip":"172.16.83.67"}],"state":"Dirty"}];
      // const req1 = httpTestingController.expectOne('/api/get_rulesets/All');
      // req1.flush(data1);
      const data1 = [{"_id":73334,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-06 05:32:53","groupName":"Threat Feeds","isEnabled":false,"lastModifiedDate":"2020-02-27 00:11:41","name":"Emerging Threats","sensors":[],"state":"Dirty"},{"_id":73346,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-28 02:56:45","groupName":"Bugs","isEnabled":true,"lastModifiedDate":"2020-02-28 02:56:45","name":"Bug Hunter 5000","sensors":[{"hostname":"acostatest3-sensor1.lan","mac":"00:50:56:9d:79:28","management_ip":"172.16.83.67"}],"state":"Dirty"}];
      const req1 = httpTestingController.expectOne('/api/ruleset');
      req1.flush(data1);

      // const data2 = ["Bugs","Threat Feeds","All"];
      // const req2 = httpTestingController.expectOne('/api/get_ruleset_groups');
      // req2.flush(data2);

      const data3 = [{"appVersion":"4.1.4","application":"suricata","deployment_name":"acostatest3-sensor1-suricata","hostname":"acostatest3-sensor1.lan","node_type":"Sensor","status":"DEPLOYED","version":"1.0.0"}];
      const req3 = httpTestingController.expectOne('/api/catalog/chart/suricata/status');
      req3.flush(data3);

      fixture.whenStable().then(() => {
        const data4 = [];
        const req4 = httpTestingController.expectOne('/api/catalog/chart/zeek/status');
        req4.flush(data4);
        // const XHRUrl = httpTestingController.expectOne('/api/get_rulesets/All');
        // XHRUrl.flush(ALL_RULESETS);
        // expect(XHRUrl.request.body).toEqual(ALL_RULESETS);

        httpTestingController.verify();

        fixture.detectChanges();

        spyOn(component, 'openRemoveRuleSetConfirmModal');
        const buttons = fixture.debugElement.nativeElement.querySelectorAll('.mat-column-Actions button ~ button');
        buttons[1].click();
        expect(component.openRemoveRuleSetConfirmModal).toHaveBeenCalledWith((component.ruleSetsDataSource.data[0]) as RuleSet);

        const snackbar = TestBed.inject(MatSnackBar);
        spyOn(snackbar, 'open');

        const some = component.ruleSetsDataSource.data[0];
        component.removeRuleSet(((component.ruleSetsDataSource.data[1]) as RuleSet)._id);
        const req5 = httpTestingController.expectOne('/api/delete_ruleset/73346');
        const data5 = {"success_message":"Successfully deleted rule set."};
        req5.flush(data5);
        expect(snackbar.open).toHaveBeenCalled();

        expect(component.ruleSetsDataSource.data.length).toBe(1);
        expect(component.ruleSetsDataSource.data[0]).toBe(some);

      });
    }));
  });
