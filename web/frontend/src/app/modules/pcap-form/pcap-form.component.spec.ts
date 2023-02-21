import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockPCAPClassArray,
  MockPCAPClassFlawedAmmyyTraffic
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { TestingModule } from '../testing-modules/testing.module';
import { ReplayPCAPInterface } from './interfaces/replay-pcap.interface';
import { PcapFormComponent } from './pcap-form.component';
import { PCAPFormModule } from './pcap-form.module';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_mock_file_list = (files: MockFile[]) => {
  const file_list: FileList = {
    length: files.length,
    item(index: number): File {
      return file_list[index];
    }
  };
  files.forEach((file, index) => file_list[index] = create_file_from_mock_file(file));

  return file_list;
};

const create_file_from_mock_file = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob as File;
};

describe('PcapFormComponent', () => {
  let component: PcapFormComponent;
  let fixture: ComponentFixture<PcapFormComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyHandleFileInput: jasmine.Spy<any>;
  let spyUploadFile: jasmine.Spy<any>;
  let spyGetPcapHashes: jasmine.Spy<any>;
  let spyReplayPcapDialog: jasmine.Spy<any>;
  let spyDeletePcapConfirmDialog: jasmine.Spy<any>;
  let spyApiGetPcaps: jasmine.Spy<any>;
  let spyApiUploadPcap: jasmine.Spy<any>;
  let spyApiReplayPcap: jasmine.Spy<any>;
  let spyApiDeletePcap: jasmine.Spy<any>;

  // Test Data
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const mock_file_list: FileList = create_mock_file_list([mock_file]);
  const pcap_form_data: FormData = new FormData();
  pcap_form_data.append('upload_file', create_file_from_mock_file(mock_file), mock_file.name);
  const replay_pcap_interface: ReplayPCAPInterface = {
    ifaces: '',
    pcap: MockPCAPClassFlawedAmmyyTraffic.name,
    preserve_timestamp: true,
    sensor_hostname: 'fake-sensor3.fake',
    sensor_ip: '10.40.31.70'
  };
  const replay_pcap_form_group: FormGroup = new FormGroup({});
  const replay_pcap_interface_keys: string[] = Object.keys(replay_pcap_interface);
  replay_pcap_interface_keys.forEach((key: string) => {
    replay_pcap_form_group.addControl(key, new FormControl(replay_pcap_interface[key]));
  });
  replay_pcap_form_group.markAllAsTouched();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PCAPFormModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: 'test pcap name' }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcapFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyHandleFileInput = spyOn(component, 'handle_file_input').and.callThrough();
    spyUploadFile = spyOn(component, 'upload_file').and.callThrough();
    spyGetPcapHashes = spyOn(component, 'get_pcap_hashes').and.callThrough();
    spyReplayPcapDialog = spyOn(component, 'replay_pcap_dialog').and.callThrough();
    spyDeletePcapConfirmDialog = spyOn(component, 'delete_pcap_confirm_dialog').and.callThrough();
    spyApiGetPcaps = spyOn<any>(component, 'api_get_pcaps_').and.callThrough();
    spyApiUploadPcap = spyOn<any>(component, 'api_upload_pcap_').and.callThrough();
    spyApiReplayPcap = spyOn<any>(component, 'api_replay_pcap_').and.callThrough();
    spyApiDeletePcap = spyOn<any>(component, 'api_delete_pcap_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyHandleFileInput.calls.reset();
    spyUploadFile.calls.reset();
    spyGetPcapHashes.calls.reset();
    spyReplayPcapDialog.calls.reset();
    spyDeletePcapConfirmDialog.calls.reset();
    spyApiGetPcaps.calls.reset();
    spyApiUploadPcap.calls.reset();
    spyApiReplayPcap.calls.reset();
    spyApiDeletePcap.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create PcapFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PcapFormComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_pcaps_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_pcaps_']).toHaveBeenCalled();
      });
    });

    describe('handle_file_input()', () => {
      it('should call should_preserve_timestamp()', () => {
        reset();

        component.handle_file_input(mock_file_list);

        expect(component.handle_file_input).toHaveBeenCalled();
      });

      it('should call handle_file_input() and set component.pcap_for_upload from file list', () => {
        reset();

        component.pcap_for_upload = null;
        component.handle_file_input(mock_file_list);

        expect(component.pcap_for_upload).toEqual(mock_file_list.item(0));
      });
    });

    describe('upload_file()', () => {
      it('should call upload_file()', () => {
        reset();

        component.pcap_for_upload = create_file_from_mock_file(mock_file);
        component.upload_file();

        expect(component.upload_file).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from upload_file()', () => {
        reset();

        component.pcap_for_upload = create_file_from_mock_file(mock_file);
        component.upload_file();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_upload_pcap_() from upload_file()', () => {
        reset();

        component.pcap_for_upload = create_file_from_mock_file(mock_file);
        component.upload_file();

        expect(component['api_upload_pcap_']).toHaveBeenCalled();
      });
    });

    describe('get_pcap_hashes()', () => {
      it('should call get_pcap_hashes()', () => {
        reset();

        component.get_pcap_hashes(MockPCAPClassFlawedAmmyyTraffic.hashes);

        expect(component['get_pcap_hashes']).toHaveBeenCalled();
      });

      it('should call get_pcap_hashes() and return string containing hashes', () => {
        reset();

        const return_value: string = component.get_pcap_hashes(MockPCAPClassFlawedAmmyyTraffic.hashes);

        expect(return_value).toContain(MockPCAPClassFlawedAmmyyTraffic.hashes.md5);
        expect(return_value).toContain(MockPCAPClassFlawedAmmyyTraffic.hashes.sha1);
        expect(return_value).toContain(MockPCAPClassFlawedAmmyyTraffic.hashes.sha256);
      });
    });

    describe('replay_pcap_dialog()', () => {
      it('should call replay_pcap_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(replay_pcap_form_group) } as MatDialogRef<typeof component>);

        component.replay_pcap_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component.replay_pcap_dialog).toHaveBeenCalled();
      });

      it('should call api_replay_pcap_() after mat dialog ref closed from within replay_pcap_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(replay_pcap_form_group) } as MatDialogRef<typeof component>);

        component.replay_pcap_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_replay_pcap_']).toHaveBeenCalled();
      });

      it('should not call api_replay_pcap_() after mat dialog ref closed from within replay_pcap_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.replay_pcap_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_replay_pcap_']).not.toHaveBeenCalled();
      });
    });

    describe('delete_pcap_confirm_dialog()', () => {
      it('should call delete_pcap_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_pcap_confirm_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component.delete_pcap_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_delete_pcap_() after mat dialog ref closed from within delete_pcap_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_pcap_confirm_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_delete_pcap_']).toHaveBeenCalled();
      });

      it('should not call api_delete_pcap_() after mat dialog ref closed from within delete_pcap_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_pcap_confirm_dialog(MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_delete_pcap_']).not.toHaveBeenCalled();
      });
    });

    describe('private api_get_pcaps_()', () => {
      it('should call api_get_pcaps_()', () => {
        reset();

        component['api_get_pcaps_']();

        expect(component['api_get_pcaps_']).toHaveBeenCalled();
      });

      it('should call global_pcap_service_.get_pcaps() from api_get_pcaps_()', () => {
        reset();

        component['api_get_pcaps_']();

        expect(component['global_pcap_service_'].get_pcaps).toHaveBeenCalled();
      });

      it('should global_pcap_service_.get_pcaps() and set pcaps table data', () => {
        reset();

        component.pcaps.data = [];
        component['api_get_pcaps_']();

        expect(component.pcaps.data.length).toEqual(MockPCAPClassArray.length);
      });

      it('should call global_pcap_service_.get_pcaps() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_pcap_service_'], 'get_pcaps').and.returnValue(throwError(mock_http_error_response));

        component['api_get_pcaps_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_upload_pcap_()', () => {
      it('should call api_upload_pcap_()', () => {
        reset();

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['api_upload_pcap_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.upload_pcap() from api_upload_pcap_()', () => {
        reset();

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['pcap_service_'].upload_pcap).toHaveBeenCalled();
      });

      it('should call pcap_service_.upload_pcap() and set component.pcap_for_upload = null', () => {
        reset();

        component.pcap_for_upload = {} as any;

        component['api_upload_pcap_'](pcap_form_data);

        expect(component.pcap_for_upload).toBeNull();
      });

      it('should call pcap_service_.upload_pcap() and on success call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_get_pcaps_() from pcap_service_.upload_pcap() on success', () => {
        reset();

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['api_get_pcaps_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.upload_pcap() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'upload_pcap').and.returnValue(throwError(MockErrorMessageClass));

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call pcap_service_.upload_pcap() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'upload_pcap').and.returnValue(throwError(mock_http_error_response));

        component['api_upload_pcap_'](pcap_form_data);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_replay_pcap_()', () => {
      it('should call api_replay_pcap_()', () => {
        reset();

        component['api_replay_pcap_'](replay_pcap_interface);

        expect(component['api_replay_pcap_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.replay_pcap() from api_replay_pcap_()', () => {
        reset();

        component['api_replay_pcap_'](replay_pcap_interface);

        expect(component['pcap_service_'].replay_pcap).toHaveBeenCalled();
      });

      it('should pcap_service_.replay_pcap() and on success call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_replay_pcap_'](replay_pcap_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call pcap_service_.replay_pcap() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'replay_pcap').and.returnValue(throwError(mock_http_error_response));

        component['api_replay_pcap_'](replay_pcap_interface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_pcap_()', () => {
      it('should call api_delete_pcap_()', () => {
        reset();

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_delete_pcap_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.delete_pcap() from api_delete_pcap_()', () => {
        reset();

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['pcap_service_'].delete_pcap).toHaveBeenCalled();
      });

      it('should pcap_service_.delete_pcap() and on success call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should pcap_service_.delete_pcap() and on success call api_get_pcaps_()', () => {
        reset();

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['api_get_pcaps_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.delete_pcap() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'delete_pcap').and.returnValue(throwError(MockErrorMessageClass));

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call pcap_service_.delete_pcap() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'delete_pcap').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_pcap_'](MockPCAPClassFlawedAmmyyTraffic);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});
