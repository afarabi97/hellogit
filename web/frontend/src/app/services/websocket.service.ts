import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as socketIo from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  // TODO - update with neccessary criteria

  private webSocketURL_: string;
  private webSocketOptions_;
  private webSocket_;

  constructor() {
    this.webSocketOptions_ = {transports: ['websocket'], upgrade: false};
    this.webSocketURL_ = `${environment.production ? 'https://' : 'http://'}${window.location.hostname}`;
    this.webSocket_ = socketIo(this.webSocketURL_, this.webSocketOptions_);
  }

  getSocket() {
    return this.webSocket_;
  }

  send(message: any): void {
    this.webSocket_.emit('message', message);
  }

  onBroadcast(): Observable<any> {
    return new Observable<any>(
      (observer: Subscriber<any>) => {
        this.webSocket_.on('broadcast', (data: any) => {
          observer.next(data);
        });
      });
  }

  onEvent(event: any): Observable<any> {
    return new Observable<any>(
      (observer: Subscriber<any>) => {
        this.webSocket_.on(event, () => observer.next());
      });
  }
}
