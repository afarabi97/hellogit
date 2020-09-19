import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { KickstartService } from './kickstart.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { KitService } from './kit.service';

@Injectable({
  providedIn: 'root'
})
export class SystemSetupService {

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              private matDialog: MatDialog,
              public kickStartSrv: KickstartService,
              public kitSrv: KitService,
              private formBuilder: FormBuilder,
              private router: Router) { }

  getAddNodeWizardState(): Observable<Object> {
    const url = '/api/get_add_node_wizard_state';
    return this.http.get(url).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  openKickstartConsole(job_id: string="Kickstart"): void {
    this.router.navigate([`/stdout/Kickstart/${job_id}`]);
  }

  public executeKickstart(kickstartForm: FormGroup) {
    let payload = kickstartForm.getRawValue();
    this.kickStartSrv.generateKickstartInventory(payload).subscribe(data => {
      this.openKickstartConsole(data["job_id"]);
    });
  }

  public putKickstartNode(node: FormGroup): void {
    let payload = node.getRawValue();
    this.kickStartSrv.putKickstartNode(payload).subscribe(data => {
      this.openKickstartConsole(data["job_id"]);
    });
  }

  public executeMIPKickstart(kickstartForm: FormGroup) {
    let payload = kickstartForm.getRawValue();
    delete payload['re_password'];
    delete payload['confirm_luks_password'];
    this.kickStartSrv.generateMIPKickstartInventory(payload).subscribe(data => {
      if (data !== null && data['error_message']) {
        console.error(data);
      } else {
        this.openKickstartConsole()
      }
    });
  }

}
