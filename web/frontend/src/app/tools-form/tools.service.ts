import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  changeKitClock(timeObj: Object) {
    const url = '/api/change_kit_clock';
    return this.http.post(url, timeObj).pipe();
  }

  changeKitPassword(passwordForm: Object, amendedPasswords: Array<Object>){
    const url = '/api/change_kit_password';
    let payload = {passwordForm: passwordForm, amendedPasswords: amendedPasswords}
    return this.http.post(url, payload).pipe();
  }

  uploadDocumentation(pcap_file: File): Observable<Object> {
    const url = '/api/update_documentation';
    const formData = new FormData();
    formData.append('upload_file', pcap_file, pcap_file.name)
    return this.http.post(url, formData).pipe();
  }

  change_state_of_remote_network_device(node: string, device: string, state: string): Observable<Object>{
    const url = `/api/${node}/set_interface_state/${device}/${state}`;
    return this.http.post(url, {});
  }

  get_monitoring_interfaces(): Observable<Object>{
    const url = `/api/monitoring_interfaces`;
    return this.http.get(url);
  }

  mountNFSshares(nfsSetup: FormGroup): Observable<Object> {
    const url = '/api/mount_nfs_shares'
    return this.http.post(url, nfsSetup.value).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  restartElasticSearch(associatedPods: Array<{podName:string, namespace: string}>): Observable<Object> {
    const url = '/api/restart_elastic_search_and_complete_registration';
    return this.http.post(url, associatedPods);
  }

  isELKSnapshotRepoSetup(): Observable<Object> {
    const url = '/api/elk_snapshot_state';
    return this.http.get(url);
  }

  getELKSnapshots(): Observable<Object> {
    const url = '/api/get_elasticsearch_snapshots';
    return this.http.get(url);
  }

  takeSnapshot(): Observable<Object> {
    const url = '/api/take_elasticsearch_snapshot';
    return this.http.get(url);
  }

  getPortalLinks(): Observable<Object> {
    const url = '/api/get_portal_links';
    return this.http.get(url);
  }

  getAssociatedPods(config_map_name: string): Observable<Object>{
    const url = `/api/get_associated_pods/${config_map_name}`
    return this.http.get(url).pipe();
  }

}
