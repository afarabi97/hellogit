import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EndgameService{

  constructor(private http: HttpClient) { }

  getEndgameSensorProfiles(payload: Object) : Observable<any>{
      let url = '/api/endgame_sensor_profiles'
      return this.http.post(url, payload).pipe();
  }
}
