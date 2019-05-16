import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { HTTP_OPTIONS } from './globals';


export interface Message {
  message: string
}

export class MySocket extends Socket {
 
  constructor() {
    if (environment.production){      
      super({ url: window.location.origin, options: {} });      
    } else {
      super({ url: "http://" + window.location.hostname + ":5001", options: {} });
    }
  }

}

@Injectable({
  providedIn: 'root'
})
export class ServerStdoutService {
  private socket: Socket;
  constructor(private http: HttpClient) { 
    this.socket = new MySocket();
  }

  sendMessage(msg: string){
    this.socket.emit("message", msg);
  }

  getMessage(){    
    return this.socket.fromEvent("message").pipe();
  }

  getConsoleOutput(jobName: string){
    const url = `/api/get_console_logs/${jobName}`;
    return this.http.get(url).pipe();
  }

  removeConsoleOutput(id_obj: {jobName: string, jobid: string}){
    const url = '/api/remove_console_output';
    return this.http.post(url, id_obj);
  }

  killJob(jobName: string){
    const url = '/api/kill_job';
    let payload = { jobName: jobName };
    return this.http.post(url, payload);
  }
}
