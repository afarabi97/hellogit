import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as socketIo from 'socket.io-client';

const SERVER_URL = "http://" + window.location.hostname + ":5001";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket;

  public initSocket(): void {
      this.socket = socketIo(SERVER_URL);
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
