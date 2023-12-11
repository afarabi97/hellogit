import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  MockControllerInfoClass,
  MockGeneralSettingsClass,
  MockGenericJobAndKeyClass,
  MockKitSettingsClass,
  MockKitStatusClass,
  MockMipSettingsClass,
  MockNodeClassArray,
  MockSuccessMessageClass,
  MockVMWareDataClass,
  MockVMWareSettingsClass
} from '../../../static-data/class-objects';
import { MockUnusedIpAddresses, MockUsedIpAddresses } from '../../../static-data/return-data';
import {
  ControllerInfoClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  KitSettingsClass,
  KitStatusClass,
  MipSettingsClass,
  NodeClass,
  SuccessMessageClass,
  VMWareDataClass,
  VMWareSettingsClass
} from '../classes';
import { MipSettingsInterface, VMWareSettingsInterface } from '../interfaces';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_mock_blob = (file: MockFile): Blob => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob;
};

@Injectable()
export class KitSettingsServiceSpy {

  getUnusedIPAddresses = jasmine.createSpy('getUnusedIPAddresses').and.callFake(
    (mng_ip: string, netmask: string): Observable<string[]> => this.call_fake_get_unused_ip_addresses(mng_ip, netmask)
  );

  get_used_ip_addresses = jasmine.createSpy('get_used_ip_addresses').and.callFake(
    (mng_ip: string, netmask: string): Observable<string[]> => this.call_fake_get_used_ip_addresses(mng_ip, netmask)
  );

  get_controller_info = jasmine.createSpy('get_controller_info').and.callFake(
    (): Observable<ControllerInfoClass> => this.call_fake_get_controller_info()
  );

  get_vmware_settings = jasmine.createSpy('get_vmware_settings').and.callFake(
    (): Observable<VMWareSettingsClass> => this.call_fake_get_vmware_settings()
  );

  save_vmware_settings = jasmine.createSpy('save_vmware_settings').and.callFake(
    (vmware_settings: VMWareSettingsInterface): Observable<boolean> => this.call_fake_save_vmware_settings(vmware_settings)
  );

  test_vmware_settings = jasmine.createSpy('test_vmware_settings').and.callFake(
    (vmware_settings: VMWareSettingsInterface): Observable<VMWareDataClass> => this.call_fake_test_vmware_settings(vmware_settings)
  );

  getKitSettings = jasmine.createSpy('getKitSettings').and.callFake(
    (): Observable<KitSettingsClass> => this.call_fake_get_kit_settings()
  );

  update_kit_settings = jasmine.createSpy('update_kit_settings').and.callFake(
    (kit_settings: KitSettingsClass): Observable<GenericJobAndKeyClass> => this.call_fake_update_kit_settings(kit_settings)
  );

  get_mip_settings = jasmine.createSpy('get_mip_settings').and.callFake(
    (): Observable<MipSettingsClass> => this.call_fake_get_mip_settings()
  );

  update_mip_settings = jasmine.createSpy('update_mip_settings').and.callFake(
    (mip_settings: MipSettingsInterface): Observable<SuccessMessageClass> => this.call_fake_update_mip_settings(mip_settings)
  );

  getGeneralSettings = jasmine.createSpy('getGeneralSettings').and.callFake(
    (): Observable<GeneralSettingsClass> => this.call_fake_get_general_settings()
  );

  update_general_settings = jasmine.createSpy('update_general_settings').and.callFake(
    (general_settings: GeneralSettingsClass): Observable<GenericJobAndKeyClass> => this.call_fake_update_general_settings(general_settings)
  );

  setup_control_plane = jasmine.createSpy('setup_control_plane').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_setup_control_plane()
  );

  refresh_kit = jasmine.createSpy('refresh_kit').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_refresh_kit()
  );

  update_device_facts = jasmine.createSpy('update_device_facts').and.callFake(
    (node_hostname: string): Observable<SuccessMessageClass> => this.call_fake_update_device_facts(node_hostname)
  );

  add_node = jasmine.createSpy('add_node').and.callFake(
    (payload): Observable<GenericJobAndKeyClass> => this.call_fake_add_node(payload)
  );

  get_nodes = jasmine.createSpy('get_nodes').and.callFake(
    (): Observable<NodeClass[]> => this.call_fake_get_nodes()
  );

  delete_node = jasmine.createSpy('delete_node').and.callFake(
    (hostname: string): Observable<GenericJobAndKeyClass> => this.call_fake_delete_node(hostname)
  );

  addMip = jasmine.createSpy('addMip').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_add_mip()
  );

  deploy_kit = jasmine.createSpy('deploy_kit').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_deploy_kit()
  );

  get_kit_status = jasmine.createSpy('get_kit_status').and.callFake(
    (): Observable<KitStatusClass> => this.call_fake_get_kit_status()
  );

  get_open_vpn_certs = jasmine.createSpy('get_open_vpn_certs').and.callFake(
    (node_hostname: string): Observable<Blob> => this.call_fake_get_open_vpn_certs(node_hostname)
  );

  call_fake_get_unused_ip_addresses(mng_ip: string, netmask: string): Observable<string[]> {
    return of(MockUnusedIpAddresses);
  }

  call_fake_get_used_ip_addresses(mng_ip: string, netmask: string): Observable<string[]> {
    return of(MockUsedIpAddresses);
  }

  call_fake_get_controller_info(): Observable<ControllerInfoClass> {
    return of(MockControllerInfoClass);
  }

  call_fake_get_vmware_settings(): Observable<VMWareSettingsClass> {
    return of(MockVMWareSettingsClass);
  }

  call_fake_save_vmware_settings(vmware_settings: VMWareSettingsInterface): Observable<boolean> {
    return of(true);
  }

  call_fake_test_vmware_settings(vmware_settings: VMWareSettingsInterface): Observable<VMWareDataClass> {
    return of(MockVMWareDataClass);
  }

  call_fake_get_kit_settings(): Observable<KitSettingsClass> {
    return of(MockKitSettingsClass);
  }

  call_fake_update_kit_settings(kit_settings: KitSettingsClass): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_get_mip_settings(): Observable<MipSettingsClass> {
    return of(MockMipSettingsClass);
  }

  call_fake_update_mip_settings(mip_settings: MipSettingsInterface): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_get_general_settings(): Observable<GeneralSettingsClass> {
    return of(MockGeneralSettingsClass);
  }

  call_fake_update_general_settings(general_settings: GeneralSettingsClass): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_setup_control_plane(): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_refresh_kit(): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_update_device_facts(node_hostname: string): Observable<SuccessMessageClass> {
    return of(MockSuccessMessageClass);
  }

  call_fake_add_node(payload): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_get_nodes(): Observable<NodeClass[]> {
    return of(MockNodeClassArray);
  }

  call_fake_delete_node(hostname: string): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_add_mip(): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_deploy_kit(): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_get_kit_status(): Observable<KitStatusClass> {
    return of(MockKitStatusClass);
  }

  call_fake_get_open_vpn_certs(node_hostname: string): Observable<Blob> {
    const mock_file: MockFile = {
      name: 'FakeFileName.zip',
      body: 'FakeFileBody',
      mimeType: 'application/zip'
    };

    return of(create_mock_blob(mock_file));
  }
}
