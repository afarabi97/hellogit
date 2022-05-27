import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebsocketService } from '../../../services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ServerStdoutService {

  constructor(private http: HttpClient,
              private srvSocket: WebsocketService) {
  }

  sendMessage(msg: string){
    this.srvSocket.getSocket().emit('message', msg);
  }

  getMessage(){
    return new Observable<any>(observer => {
      this.srvSocket.getSocket().on('message', (data: any) => {
        observer.next(data);
      });
    });
  }

  getConsoleOutput(jobId: string){
    const url = `/api/jobs/log/${jobId}`;
    return this.http.get(url).pipe();
  }

  getJob(jobId: string){
    const url = `/api/jobs/${jobId}`;
    return this.http.get(url).pipe();
  }

  killJob(jobId: string){
    const url = `/api/jobs/${jobId}`;
    return this.http.delete(url);
  }

  retryJob(jobId: string){
    const url = `/api/jobs/${jobId}/retry`;
    return this.http.put(url, null);
  }
}
