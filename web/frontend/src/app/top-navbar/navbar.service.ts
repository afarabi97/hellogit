import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class Version{
  version: string;
  commit_hash: string;
  build_date: string;

  constructor(version: string, commit_hash: string, build_date: string){
    this.version = version;
    this.commit_hash = commit_hash;
    this.build_date = build_date;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  constructor(private http: HttpClient) { }

  private mapVersion(data): Version {
    return new Version(data['version'], data['commit_hash'].substring(0,8), data['build_date']);
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
