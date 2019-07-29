import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP_OPTIONS } from './globals';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {

  constructor(private http: HttpClient) { }

  archiveForm(archiveForm: Object, pageForm: Object, formKey: string){    
    const url = '/api/archive_form';
    archiveForm['config_id'] = formKey
    archiveForm['form'] = pageForm
    console.log(archiveForm);
    return this.http.post(url, archiveForm, HTTP_OPTIONS);
  }

  archiveForm2(archiveForm){    
    const url = '/api/archive_form';
    return this.http.post(url, archiveForm, HTTP_OPTIONS);
  }

  deleteArchive(configId: string, archiveId: string){
    const url = `/api/delete_archive/${configId}/${archiveId}`
    return this.http.delete(url);
  }

  restoreArchivedForm(configId: string, archiveId: string): Observable<Object> {
    const url = '/api/restore_archived';
    let post_payload = {"_id": archiveId, "config_id": configId};
    return this.http.post(url, post_payload , HTTP_OPTIONS);
  }

  getArchivedForms(configId: string): Observable<Object> {
    const url = `/api/get_archived/${configId}`;  
    return this.http.get(url);
  }
}
