import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material';


@Injectable({
  providedIn: 'root'
})
export class PcapService {
  constructor(private http: HttpClient,
              private snackBar: MatSnackBar) { }

  getPcaps(){
    const url = '/api/get_pcaps';
    return this.http.get(url).pipe();
  }

  uploadPcap(pcap_file: File): Observable<Object> {
    const url = '/api/create_pcap';
    const formData = new FormData();
    formData.append('upload_file', pcap_file, pcap_file.name)
    return this.http.post(url, formData).pipe();
  }

  deletePcap(pcap_name: string): Observable<Object> {
    const url = `/api/delete_pcap/${pcap_name}`;
    return this.http.delete(url).pipe();
  }

  replayPcap(payload: Object): Observable<Object> {
    const url = "/api/replay_pcap"
    return this.http.post(url, payload);
  }

  getConfiguredIfaces(sensor_hostname: string): Observable<Object> {
    const url = `/api/catalog/get_configured_ifaces/${sensor_hostname}`;
    return this.http.get(url);
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }
}
