import { PcapService } from './pcap.service';
import { PcapFormComponent } from './pcap-form.component';
import { MatTableModule } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog'; 
import { MatCardModule } from '@angular/material/card';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';


//describe the begining of test suite here
describe('Pcap loading', () => {
  let component: PcapFormComponent;
  let fixture: ComponentFixture<PcapFormComponent>;
  let httpTestingController: HttpTestingController;

beforeEach(async(() => {
  TestBed.configureTestingModule({
  declarations: [ PcapFormComponent ],
  providers: [PcapService, Title ], 
  imports: [ MatDialogModule, MatCardModule, MatTableModule, HttpClientTestingModule, MatSnackBarModule, MatPaginatorModule, NoopAnimationsModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcapFormComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.get(HttpTestingController);
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  //mocking loading pcaps
  it('it should choose pcap', () => {

    const file = new File(["mock"], "mockfile.txt", { type: "text/plain", });

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => file
    };
    const input = fixture.debugElement.query(By.css('#pcap_file_uploader'));
    spyOn(component, 'handleFileInput').and.callThrough();
    input.triggerEventHandler('change', {'target': {'files': fileList}});
    expect(component.handleFileInput).toHaveBeenCalledWith(fileList);
    expect(component.pcapToUpload).toEqual(file);

  });

  it('should set the title during ngOnInit', async(() => {
      const pcaps = [{"createdDate":"2020-02-06 05:32:54","hashes":{"md5":"8226f1dda88c29cf3ef191357a59d47f","sha1":"074e232ddcb6a2a5795ea7ee09784f8265030438","sha256":"89687b5d606ba818f0a100e92c9e48641aacfcb32c2c122c5d3002cfa1802cb7"},"name":"2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap","size":7639515},{"createdDate":"2020-02-06 05:32:54","hashes":{"md5":"4b9f943d8f2e14282e17c4b1410131ea","sha1":"f3ca111182d8a3b46cd4a87699e6e3dbc6806af6","sha256":"19ce2fb46685b832cda2225e0599c4492dfb2ffb48eba7848f8300b15a8e15e3"},"name":"2019-03-06-Flawed-Ammyy-traffic.pcap","size":4610405},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"317875a8221d0c9080ed9637d6d58278","sha1":"8ca143dd2c14d0359672bffee8056b4c85a47955","sha256":"d2f4cc20ff022366938755b15a230eb2d8ec43c3cab8dfdb78356c4eb13126e7"},"name":"2019-05-01-password-protected-doc-infection-traffic.pcap","size":6992374},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"7d3d4b76ff7263aea127c6139d125caf","sha1":"1e12def6b7363dcaefaaa2df8b5cc3b464baf971","sha256":"b50612f71b0b1e61419ed457024d0ac65d827989b7e02db7eb05224071776fd6"},"name":"2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap","size":3335658},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"6d0caf194cc6afd63c358e0bd339fc8e","sha1":"964c4da074f4d8d000b3f52b8d0ffa401da7a284","sha256":"6c111fcab4b320174aae040f5fef894a310b0ee23d505d7ba8dc50d5b8ef2994"},"name":"2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap","size":743725},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"98dbf3348d356ec6becee616f5ac309a","sha1":"8388519bb49e72cc4639eb3efbb8dec36228cfb5","sha256":"df2b7f722a207d993100aff1dfe4a7bf7ad85139f867dfd99b76cd7e46b101af"},"name":"2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap","size":1274254},{"createdDate":"2020-02-18 17:23:34","hashes":{"md5":"e042e77535ee876248281804d0be7d21","sha1":"76a6f19ee99f95ff5cd7e1f7ed4acd7f9210ecd7","sha256":"d45293c1d0c34b390e603acf027316c91341ab25825fd978110c6240d46df990"},"name":"egypt-packetlogic-ttl-localization.pcap","size":23590},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"59994f08e9dd9739c3a9b529ecf997d2","sha1":"454827ec66631d2af6b78b73628480b5328aa7f5","sha256":"feb8befd8d6891511bd00471d153a2bf8d57d022e1d81e00755941b872fdc355"},"name":"wannacry.pcap","size":37791327}];

      fixture.detectChanges();

      const req = httpTestingController.expectOne('/api/get_pcaps');
      req.flush(pcaps);

      expect(req.request.method).toEqual('GET');
  
      httpTestingController.verify();

      fixture.whenStable().then(() => {
        let title = TestBed.get(Title);
        expect(title.getTitle()).toEqual('PCAP Test Files');
      });
  }));

  it('should fill the pcap table', async(() => {
    const pcaps = [{"createdDate":"2020-02-06 05:32:54","hashes":{"md5":"8226f1dda88c29cf3ef191357a59d47f","sha1":"074e232ddcb6a2a5795ea7ee09784f8265030438","sha256":"89687b5d606ba818f0a100e92c9e48641aacfcb32c2c122c5d3002cfa1802cb7"},"name":"2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap","size":7639515},{"createdDate":"2020-02-06 05:32:54","hashes":{"md5":"4b9f943d8f2e14282e17c4b1410131ea","sha1":"f3ca111182d8a3b46cd4a87699e6e3dbc6806af6","sha256":"19ce2fb46685b832cda2225e0599c4492dfb2ffb48eba7848f8300b15a8e15e3"},"name":"2019-03-06-Flawed-Ammyy-traffic.pcap","size":4610405},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"317875a8221d0c9080ed9637d6d58278","sha1":"8ca143dd2c14d0359672bffee8056b4c85a47955","sha256":"d2f4cc20ff022366938755b15a230eb2d8ec43c3cab8dfdb78356c4eb13126e7"},"name":"2019-05-01-password-protected-doc-infection-traffic.pcap","size":6992374},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"7d3d4b76ff7263aea127c6139d125caf","sha1":"1e12def6b7363dcaefaaa2df8b5cc3b464baf971","sha256":"b50612f71b0b1e61419ed457024d0ac65d827989b7e02db7eb05224071776fd6"},"name":"2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap","size":3335658},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"6d0caf194cc6afd63c358e0bd339fc8e","sha1":"964c4da074f4d8d000b3f52b8d0ffa401da7a284","sha256":"6c111fcab4b320174aae040f5fef894a310b0ee23d505d7ba8dc50d5b8ef2994"},"name":"2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap","size":743725},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"98dbf3348d356ec6becee616f5ac309a","sha1":"8388519bb49e72cc4639eb3efbb8dec36228cfb5","sha256":"df2b7f722a207d993100aff1dfe4a7bf7ad85139f867dfd99b76cd7e46b101af"},"name":"2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap","size":1274254},{"createdDate":"2020-02-18 17:23:34","hashes":{"md5":"e042e77535ee876248281804d0be7d21","sha1":"76a6f19ee99f95ff5cd7e1f7ed4acd7f9210ecd7","sha256":"d45293c1d0c34b390e603acf027316c91341ab25825fd978110c6240d46df990"},"name":"egypt-packetlogic-ttl-localization.pcap","size":23590},{"createdDate":"2020-02-06 05:32:55","hashes":{"md5":"59994f08e9dd9739c3a9b529ecf997d2","sha1":"454827ec66631d2af6b78b73628480b5328aa7f5","sha256":"feb8befd8d6891511bd00471d153a2bf8d57d022e1d81e00755941b872fdc355"},"name":"wannacry.pcap","size":37791327}];

    fixture.detectChanges();

    const req = httpTestingController.expectOne('/api/get_pcaps');
    req.flush(pcaps);

    expect(req.request.method).toEqual('GET');

    httpTestingController.verify();

    fixture.whenStable().then(() => {
        fixture.detectChanges();
        let names = getElements(fixture.nativeElement, '.mat-column-name');
        let actual = [];
        for (let name of names) {
            let text = <Text> name.firstChild;
            actual.push(text.data);
        }

        let expected = ['Name', '2018-09-06-infection-traffic-from-password-protected-Word-doc.pcap', '2019-03-06-Flawed-Ammyy-traffic.pcap', '2019-05-01-password-protected-doc-infection-traffic.pcap', '2019-07-09-password-protected-Word-doc-pushes-Dridex.pcap', '2019-08-12-Rig-EK-sends-MedusaHTTP-malware.pcap', '2019-09-03-password-protected-Word-doc-pushes-Remcos-RAT.pcap', 'egypt-packetlogic-ttl-localization.pcap', 'wannacry.pcap'];

        expect(actual).toEqual(expected);
    });
}));
//   it('it should upload', () => {
//     const loadpcap = fixture.debugElement.query(By.css('[fileInput]'));
//     spyOn(loadpcap, 'button');
//     component.ngOnInit();
//     expect(loadpcap.focus).toHaveBeenCalled();
//   });

//   it('it should delete pcap', () => {
//     const delpcap = fixture.debugElement.query(By.css('[Delete PCAP]'));
//     spyOn(loadpcap, 'button');
//     component.ngOnInit();
//     expect(loadpcap.focus).toHaveBeenCalled();
//   });

});

function getElements(element: HTMLElement, query: string): HTMLElement[] {
    return [].slice.call(element.querySelectorAll(query));
}