import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PcapService {

  constructor(private http: HttpClient) { }

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
  
}