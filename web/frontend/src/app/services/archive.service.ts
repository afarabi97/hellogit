import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { HTTP_OPTIONS } from '../constants/cvah.constants';
import { EntityConfig } from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'ArchiveService' };

/**
 * Service used for performing archive related operations
 *
 * @export
 * @class ArchiveService
 * @extends {ApiService<any>}
 */
@Injectable({
  providedIn: 'root'
})
export class ArchiveService extends ApiService<any> {
  // TODO - update with neccessary criteria

  /**
   * Creates an instance of ArchiveService.
   *
   * @memberof ArchiveService
   */
  constructor() {
    super(entityConfig);
  }

  archiveForm(archiveForm){
    return this.httpClient_.post(environment.ARCHIVE_SERVICE_ARCHIVE_FORM, archiveForm, HTTP_OPTIONS)
                           .pipe(catchError((err: any) => this.handleError('archive_form', err)));
  }

  deleteArchive(configId: string, archiveId: string){
    const url = `${environment.ARCHIVE_SERVICE_ARCHIVE_DELETE}${configId}/${archiveId}`;

    return this.httpClient_.delete(url)
                           .pipe(catchError((err: any) => this.handleError('delete_archive', err)));
  }

  restoreArchivedForm(configId: string, archiveId: string): Observable<Object> {
    const post_payload = {"_id": archiveId, "config_id": configId};

    return this.httpClient_.post(environment.ARCHIVE_SERVICE_ARCHIVE_RESTORE, post_payload , HTTP_OPTIONS)
                           .pipe(catchError((err: any) => this.handleError('restore_archived', err)));
  }

  getArchivedForms(configId: string): Observable<Object> {
    const url = `${environment.ARCHIVE_SERVICE_ARCHIVE_GET}${configId}`;

    return this.httpClient_.get(url)
                           .pipe(catchError((err: any) => this.handleError('get_archived', err)));
  }
}
