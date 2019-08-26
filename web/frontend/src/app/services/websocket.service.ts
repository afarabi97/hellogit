import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import * as socketIo from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws_url: string;
  private ws_options;
  private socket;

  constructor(){
    this.ws_options = {transports: ['websocket'], upgrade: false};
    if (environment.production){
      this.ws_url = "https://" + window.location.hostname;
    } else {
      this.ws_url = "http://" + window.location.hostname;
    }

    this.socket = socketIo(this.ws_url, this.ws_options);
  }

  public getSocket(){
    return this.socket;
  }

  public send(message: any): void {
      this.socket.emit('message', message);
  }

  public onBroadcast(): Observable<any> {
      return new Observable<any>(observer => {
          this.socket.on('broadcast', (data: any) => {
            observer.next(data);
            console.log(data);
          });
      });
  }

  public onEvent(event: any): Observable<any> {
      return new Observable<any>(observer => {
          this.socket.on(event, () => observer.next());
      });
  }
}
