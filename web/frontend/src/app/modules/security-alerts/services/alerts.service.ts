import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: HttpClient) { }

  getFields(){
    const url = '/api/alerts/fields';
    return this.http.get(url).pipe();
  }

  getAlerts(fields: string, startTime: string,
            endTime: string, acknowledged=false,
            escalated=false, showClosed=false){

    let ack = 'no';
    if (acknowledged){
      ack = 'yes';
    }

    let escalate = 'no';
    if (escalated){
      escalate = 'yes';
    }

    let showClosedAlerts = 'no';
    if (showClosed){
      showClosedAlerts = 'yes';
    }

    const url = `/api/alerts/${ack}/${escalate}/${showClosedAlerts}/${startTime}/${endTime}/${fields}`;
    return this.http.get(url).pipe();
  }

  getAlertList(alert: Object, size=0){
    const url = `/api/alerts/list/${size}`;
    return this.http.post(url, alert);
  }

  modifyAlert(alert: Object, controlForm: FormGroup, performEscalation=false, hiveForm: FormGroup = null){
    const url = '/api/alerts/modify';
    alert['form'] = controlForm.value;
    alert['form']['performEscalation'] = performEscalation;
    if (hiveForm){
      alert['form']['hiveForm'] = hiveForm.value;
    }
    return this.http.post(url, alert).pipe();
  }

  removeAlerts(alert: Object, controlForm: FormGroup){
    const url = '/api/alerts/remove';
    alert['form'] = controlForm.value;
    return this.http.post(url, alert).pipe();
  }

  saveHiveSettings(form: FormGroup){
    const url = '/api/alerts/settings';
    return this.http.post(url, form.value);
  }

  getHiveSettings(){
    const url = '/api/alerts/settings';
    return this.http.get(url);
  }

}
