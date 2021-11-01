import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: null
})
export class EndgameService {

  constructor(private http: HttpClient) { }

  getEndgameSensorProfiles(payload: Object) : Observable<any>{
      const url = '/api/agent/endgame/profiles';
      return this.http.post(url, payload).pipe();
  }
}
