import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { HTTP_OPTIONS } from '../globals';


@Injectable({
  providedIn: 'root'
})
export class LogIngestService {

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar) { }

  postFile(log_file: File, coldLogForm: Object){
    const url = '/api/upload_cold_log_file';
    const formData = new FormData();
    formData.append('upload_file', log_file, log_file.name);
    formData.append('coldLogForm', JSON.stringify(coldLogForm));
    return this.http.post(url, formData).pipe();
  }

  getWinlogbeatConfiguration(){
    const url = '/api/get_winlogbeat_configuration';
    return this.http.get(url).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  setupWinlogbeat(winlogBeatSetupForm: Object){
    const url = '/api/install_winlogbeat';
    return this.http.post(url, winlogBeatSetupForm, HTTP_OPTIONS).pipe();
  }

}
