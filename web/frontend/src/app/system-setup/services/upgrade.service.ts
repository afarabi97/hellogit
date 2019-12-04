import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EntityConfig, ApiService } from '../../services/tfplenum.service';
import { Observable } from 'rxjs';


export const config: EntityConfig = { entityPart: 'upgrade/paths', type: 'Upgrade' };
export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class UpgradeService extends ApiService<any> {

  /**
   *Creates an instance of UpgradeService.
   * @param {HttpClient} http
   * @memberof CatalogService
   */
  constructor() {
    super(config);
  }

  getUpgradePaths(originalCtrlIP: string): Observable<Object> {
    const url = '/api/upgrade/paths';
    let payload = {
      "original_controller_ip": originalCtrlIP
    };
    return this._http.post(url, payload, HTTP_OPTIONS);
  }

  doUpgrade(upgradeFormGroup: Object, upgradePathFormGroup: Object){
    const url = '/api/upgrade';

    let payload = {
      "original_controller_ip": upgradeFormGroup['original_controller_ip'],
      "new_controller_ip": upgradeFormGroup['new_ctrl_ip'],
      "username": upgradePathFormGroup['username'],
      "password": upgradePathFormGroup['password'],
      "upgrade_path": upgradePathFormGroup['selectedPath']
    }
    return this._http.post(url, payload, HTTP_OPTIONS);
  }


}
