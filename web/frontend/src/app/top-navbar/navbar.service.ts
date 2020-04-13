import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class Version{
  version: string;
  constructor(version: string){
    this.version = version;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  constructor(private http: HttpClient) { }

  private mapVersion(data): Version {
    return new Version(data);
  }

  getCurrentDIPTime(){
    const url = '/api/get_current_dip_time';
    return this.http.get(url).pipe();
  }

  public getVersion(): Observable<Version> {
    const url = "/api/version";
    return this.http.get(url).pipe(
      map((data: string) => this.mapVersion(data))
    );
  }
}
