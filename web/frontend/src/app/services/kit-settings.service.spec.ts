import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {
  MockGeneralSettingsClass,
  MockGenericJobAndKeyClass,
  MockKitStatusClass,
  MockMipSettingsClass,
  MockNodeClassArray
} from '../../../static-data/class-objects';
import { MockUnusedIpAddresses } from '../../../static-data/return-data';
import { GeneralSettingsClass, GenericJobAndKeyClass, KitStatusClass, MipSettingsClass, NodeClass } from '../classes';

@Injectable()
export class KitSettingsServiceSpy {

  getUnusedIPAddresses = jasmine.createSpy('getUnusedIPAddresses').and.callFake(
    (mng_ip: string, netmask: string): Observable<string[]> => this.call_fake_get_unused_ip_addresses(mng_ip, netmask)
  );

  getMipSettings = jasmine.createSpy('getMipSettings').and.callFake(
    (): Observable<MipSettingsClass> => this.call_fake_get_mip_settings()
  );

  getGeneralSettings = jasmine.createSpy('getGeneralSettings').and.callFake(
    (): Observable<GeneralSettingsClass> => this.call_fake_get_general_settings()
  );

  getNodes = jasmine.createSpy('getNodes').and.callFake(
    (): Observable<NodeClass[]> => this.call_fake_get_nodes()
  );

  addMip = jasmine.createSpy('addMip').and.callFake(
    (): Observable<GenericJobAndKeyClass> => this.call_fake_add_mip()
  );

  deleteNode = jasmine.createSpy('deleteNode').and.callFake(
    (hostname: string): Observable<GenericJobAndKeyClass> => this.call_fake_delete_node(hostname)
  );

  getKitStatus = jasmine.createSpy('getKitStatus').and.callFake(
    (): Observable<KitStatusClass> => this.call_fake_get_kit_status()
  );

  call_fake_get_unused_ip_addresses(mng_ip: string, netmask: string): Observable<string[]> {
    return of(MockUnusedIpAddresses);
  }

  call_fake_get_mip_settings(): Observable<MipSettingsClass> {
    return of(MockMipSettingsClass);
  }

  call_fake_get_general_settings(): Observable<GeneralSettingsClass> {
    return of(MockGeneralSettingsClass);
  }

  call_fake_get_nodes(): Observable<NodeClass[]> {
    return of(MockNodeClassArray);
  }

  call_fake_add_mip(): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_delete_node(hostname: string): Observable<GenericJobAndKeyClass> {
    return of(MockGenericJobAndKeyClass);
  }

  call_fake_get_kit_status(): Observable<KitStatusClass> {
    return of(MockKitStatusClass);
  }
}
