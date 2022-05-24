import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import * as socketIo from 'socket.io-client';

import { environment } from '../../environments/environment';
import { NotificationClass } from '../classes';
import { NotificationInterface } from '../interfaces';

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

  onBroadcast(): Observable<NotificationClass> {
    return new Observable<NotificationClass>(
      (observer: Subscriber<NotificationClass>) => {
        this.webSocket_.on('broadcast', (response: NotificationInterface) => {
          observer.next(new NotificationClass(response));
        });
      });
  }
}
