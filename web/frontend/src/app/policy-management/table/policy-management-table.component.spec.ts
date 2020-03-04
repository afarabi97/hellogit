import { PolicyManagementTable } from './policy-management-table.component';
import { of } from 'rxjs';
import { PolicyManagementService } from '../services/policy-management.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebsocketService } from '../../services/websocket.service';
import { MaterialModule } from '../../utilily-modules/material-module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, getDebugNode, DebugElement }  from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTable } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';


class MockSocket {
  getSocket() {
    return {'on': () => {}}
  }
}

describe('PolicyManagementTable', () => {
    let component: PolicyManagementTable
    let fixture: ComponentFixture<PolicyManagementTable>;
    let httpTestingController: HttpTestingController
  
  beforeEach(async(() => {
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
      httpTestingController = TestBed.get(HttpTestingController);
    });
  
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should be able to add new rule sets ', () => {
          const all_rulesets = [
            {
              "_id": 73334,
              "appType": "Suricata",
              "clearance": "Unclassified",
              "createdDate": "2020-02-06 05:32:53",
              "groupName": "Threat Feeds",
              "isEnabled": false,
              "lastModifiedDate": "2020-02-27 00:11:41",
              "name": "Emerging Threats",
              "sensors": [
          
              ],
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
          ]
          
          const ruleSetGroup = new FormGroup({
            '_id': new FormControl('0'),
            'name': new FormControl(''),
            'clearance': new FormControl('secret'),
            'sensors': new FormControl('sensor1.lan'),
            'appType': new FormControl('Zeek'),
            'isEnabled': new FormControl(true),
            'groupName': new FormControl('test')
          })

          component.ruleSetsDataSource.data = all_rulesets;

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
            "rules": [
          
            ],
            "sensors": [
              {
                "hostname": "acostatest3-sensor1.lan",
                "mac": "00:50:56:9d:79:28",
                "management_ip": "172.16.83.67"
              }
            ],
            "state": "Created"
          }
          
          const req = httpTestingController.expectOne('/api/create_ruleset');
          req.flush(additional);
          expect(req.request.body).toEqual(<RuleSet> ruleSetGroup.value);
          httpTestingController.verify();

          let length = component.ruleSetsDataSource.data.length;

          expect(component.ruleSetsDataSource.data[length - 1]).toEqual(new RuleSet(additional));

    });

    xit('should have the right paginator attached to the table in the expanded details column', async(() => {
      fixture.detectChanges();
      
      const data1 = [{"_id":73334,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-06 05:32:53","groupName":"Threat Feeds","isEnabled":false,"lastModifiedDate":"2020-02-27 00:11:41","name":"Emerging Threats","sensors":[],"state":"Dirty"},{"_id":73346,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-28 02:56:45","groupName":"Bugs","isEnabled":true,"lastModifiedDate":"2020-02-28 02:56:45","name":"Bug Hunter 5000","sensors":[{"hostname":"acostatest3-sensor1.lan","mac":"00:50:56:9d:79:28","management_ip":"172.16.83.67"}],"state":"Dirty"}];
      const req1 = httpTestingController.expectOne('/api/get_rulesets/All');
      req1.flush(data1);

      const data2 = ["Bugs","Threat Feeds","All"];
      const req2 = httpTestingController.expectOne('/api/get_ruleset_groups');
      req2.flush(data2);

      const data3 = [{"appVersion":"4.1.4","application":"suricata","deployment_name":"acostatest3-sensor1-suricata","hostname":"acostatest3-sensor1.lan","node_type":"Sensor","status":"DEPLOYED","version":"1.0.0"}];
      const req3 = httpTestingController.expectOne('/api/catalog/chart/suricata/status');
      req3.flush(data3);

      fixture.whenStable().then(() => {
        const data4 = [];
        const req4 = httpTestingController.expectOne('/api/catalog/chart/zeek/status');
        req4.flush(data4);

        httpTestingController.verify();

        fixture.detectChanges();

        const paginators = fixture.debugElement.nativeElement.querySelectorAll('mat-paginator');

        const outerPaginator = getDebugNode(paginators[paginators.length - 1]);
        const outerTable = getDebugNode(fixture.debugElement.nativeElement.querySelector('table'));

        expect(outerTable.componentInstance.dataSource.paginator).toBe(outerPaginator.componentInstance);

        const innerTables = fixture.debugElement.nativeElement.querySelectorAll('table table');
        const innerPaginators = fixture.debugElement.nativeElement.querySelectorAll('table mat-paginator');

        expect(innerTables.length).toBe(innerPaginators.length);

        const expanders = fixture.nativeElement.querySelectorAll(".mat-column-name a");

        for (let i = 0; i < expanders.length; ++i) {
          expanders[i].click();
        }

        const req5 = httpTestingController.expectOne('/api/get_rules/73334');
        const data5 = [{"_id":48639,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-mobile_malware.rules"},{"_id":48642,"isEnabled":true,"lastModifiedDate":"2020-02-27 00:11:41","ruleName":"botcc.rules"},{"_id":48645,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"botcc.portgrouped.rules"},{"_id":48648,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"dshield.rules"},{"_id":48651,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"tor.rules"},{"_id":48654,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-tftp.rules"},{"_id":48657,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-chat.rules"},{"_id":48660,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-current_events.rules"},{"_id":48663,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-web_server.rules"},{"_id":48666,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-policy.rules"},{"_id":48669,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-scada.rules"},{"_id":48672,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-pop3.rules"},{"_id":48675,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"drop.rules"},{"_id":48678,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-attack_response.rules"},{"_id":48681,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-web_client.rules"},{"_id":48684,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-icmp.rules"},{"_id":48687,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-misc.rules"},{"_id":48690,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-worm.rules"},{"_id":48693,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-p2p.rules"},{"_id":48696,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-shellcode.rules"},{"_id":48699,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-sql.rules"},{"_id":48702,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-smtp.rules"},{"_id":48705,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"compromised.rules"},{"_id":48708,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-rpc.rules"},{"_id":48711,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-telnet.rules"},{"_id":48714,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-netbios.rules"},{"_id":48717,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-snmp.rules"},{"_id":48720,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-inappropriate.rules"},{"_id":48723,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-scan.rules"},{"_id":48726,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-imap.rules"},{"_id":48729,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-dns.rules"},{"_id":48732,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-web_specific_apps.rules"},{"_id":48735,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-dos.rules"},{"_id":48738,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-voip.rules"},{"_id":48741,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-info.rules"},{"_id":48744,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-icmp_info.rules"},{"_id":48747,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-deleted.rules"},{"_id":48750,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-exploit.rules"},{"_id":48753,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-ftp.rules"},{"_id":48756,"createdDate":"2020-02-06 05:32:53","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:53","ruleName":"emerging-trojan.rules"},{"_id":48759,"createdDate":"2020-02-06 05:32:54","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:54","ruleName":"ciarmy.rules"},{"_id":48762,"createdDate":"2020-02-06 05:32:54","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:54","ruleName":"emerging-user_agents.rules"},{"_id":48765,"createdDate":"2020-02-06 05:32:54","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:54","ruleName":"emerging-games.rules"},{"_id":48768,"createdDate":"2020-02-06 05:32:54","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:54","ruleName":"emerging-malware.rules"},{"_id":48771,"createdDate":"2020-02-06 05:32:54","isEnabled":true,"lastModifiedDate":"2020-02-06 05:32:54","ruleName":"emerging-activex.rules"}];
        req5.flush(data5);

        const req6 = httpTestingController.expectOne('/api/get_rules/73346');
        const data6 = [{"_id":48774,"createdDate":"2020-02-28 02:59:22","isEnabled":true,"lastModifiedDate":"2020-02-28 02:59:22","ruleName":"Bug1"},{"_id":48777,"createdDate":"2020-02-28 02:59:45","isEnabled":true,"lastModifiedDate":"2020-02-28 02:59:45","ruleName":"Bug2"},{"_id":48789,"createdDate":"2020-02-28 03:00:31","isEnabled":true,"lastModifiedDate":"2020-02-28 03:00:31","ruleName":"Bug3"},{"_id":48792,"createdDate":"2020-02-28 03:00:50","isEnabled":true,"lastModifiedDate":"2020-02-28 03:00:50","ruleName":"Bug4"},{"_id":48795,"createdDate":"2020-02-28 03:01:08","isEnabled":true,"lastModifiedDate":"2020-02-28 03:01:08","ruleName":"Bug5"},{"_id":48798,"createdDate":"2020-02-28 03:01:27","isEnabled":true,"lastModifiedDate":"2020-02-28 03:01:27","ruleName":"Bug6"}];
        req6.flush(data6);

        for(let i = 0; i < innerTables.length; ++i) {
          const innerTable = getDebugNode(innerTables[i]);
          const innerPaginator = getDebugNode(innerPaginators[i]);

          expect(innerTable.componentInstance.dataSource.paginator).toBe(innerPaginator.componentInstance);
        }

      });

    })); 

    it('shuld be able to delete a ruleset', async(() => {
      fixture.detectChanges();
      
      const data1 = [{"_id":73334,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-06 05:32:53","groupName":"Threat Feeds","isEnabled":false,"lastModifiedDate":"2020-02-27 00:11:41","name":"Emerging Threats","sensors":[],"state":"Dirty"},{"_id":73346,"appType":"Suricata","clearance":"Unclassified","createdDate":"2020-02-28 02:56:45","groupName":"Bugs","isEnabled":true,"lastModifiedDate":"2020-02-28 02:56:45","name":"Bug Hunter 5000","sensors":[{"hostname":"acostatest3-sensor1.lan","mac":"00:50:56:9d:79:28","management_ip":"172.16.83.67"}],"state":"Dirty"}];
      const req1 = httpTestingController.expectOne('/api/get_rulesets/All');
      req1.flush(data1);

      const data2 = ["Bugs","Threat Feeds","All"];
      const req2 = httpTestingController.expectOne('/api/get_ruleset_groups');
      req2.flush(data2);

      const data3 = [{"appVersion":"4.1.4","application":"suricata","deployment_name":"acostatest3-sensor1-suricata","hostname":"acostatest3-sensor1.lan","node_type":"Sensor","status":"DEPLOYED","version":"1.0.0"}];
      const req3 = httpTestingController.expectOne('/api/catalog/chart/suricata/status');
      req3.flush(data3);

      fixture.whenStable().then(() => {
        const data4 = [];
        const req4 = httpTestingController.expectOne('/api/catalog/chart/zeek/status');
        req4.flush(data4);

        httpTestingController.verify();

        fixture.detectChanges();

        spyOn(component, 'openRemoveRuleSetConfirmModal');
        const buttons = fixture.debugElement.nativeElement.querySelectorAll('.mat-column-Actions button ~ button');
        buttons[1].click();
        expect(component.openRemoveRuleSetConfirmModal).toHaveBeenCalledWith((component.ruleSetsDataSource.data[1]) as RuleSet);

        const snackbar = TestBed.get(MatSnackBar);
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