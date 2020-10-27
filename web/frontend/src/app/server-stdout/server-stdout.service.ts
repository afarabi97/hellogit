import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WebsocketService } from '../services/websocket.service';


export interface Message {
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class ServerStdoutService {

  constructor(private http: HttpClient,
    private srvSocket: WebsocketService) {
  }

  sendMessage(msg: string){
    this.srvSocket.getSocket().emit("message", msg);
  }

  getMessage(){
    return new Observable<any>(observer => {
      this.srvSocket.getSocket().on('message', (data: any) => {
        observer.next(data);
      });
    });
  }

  getConsoleOutput(jobName: string){
    const url = `/api/get_console_logs/${jobName}`;
    return this.http.get(url).pipe();
  }

  removeConsoleOutput(id_obj: {jobName: string; jobid: string}){
    const url = '/api/remove_console_output';
    return this.http.post(url, id_obj);
  }

  killJob(jobName: string){
    const url = '/api/kill_job';
    const payload = { jobName: jobName };
    return this.http.post(url, payload);
  }
}
