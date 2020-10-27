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


  openKickstartConsole(): void {
    this.router.navigate(['/stdout/Kickstart']);
  }

  /**
   * overrides the kickstart on submit
   *
   * @private
   * @memberof KickstartFormComponent
   */
  private continueAnyways(kickstartFormOrSingleNodeForm: FormGroup) {
    let payload = kickstartFormOrSingleNodeForm.getRawValue();
    payload['continue'] = true;
    this.kickStartSrv.generateKickstartInventory(payload)
      .subscribe(data => {
        this.openKickstartConsole();
      });
  }

  public executeKickstart(kickstartFormOrSingleNodeForm: FormGroup) {
    let payload = kickstartFormOrSingleNodeForm.getRawValue();
    payload['continue'] = false;
    this.kickStartSrv.generateKickstartInventory(payload).subscribe(data => {
      if (data !== null && data['error_message']) {
        let message = data['error_message'];
        let title = "Kickstart Error";
        let option1 = "Cancel";
        let option2 = "Continue";
        this.matDialog.open(ConfirmDailogComponent, {
          width: '35%',
          data: { "paneString": message, "paneTitle": title, "option1": option1, "option2": option2 },
        }).afterClosed().subscribe(response => {
          if (response == option2) {
            this.continueAnyways(kickstartFormOrSingleNodeForm);
          }
        });
      } else {
        this.openKickstartConsole()
      }
    });
  }

  private continueMIPAnyways(kickstartFormOrSingleNodeForm: FormGroup) {
    let payload = kickstartFormOrSingleNodeForm.getRawValue();
    payload['continue'] = true;
    this.kickStartSrv.generateMIPKickstartInventory(payload)
      .subscribe(data => {
        this.openKickstartConsole();
      });
  }

  public executeMIPKickstart(kickstartForm: FormGroup) {
    let payload = kickstartForm.getRawValue();
    payload['continue'] = false;
    this.kickStartSrv.generateMIPKickstartInventory(payload).subscribe(data => {
      if (data !== null && data['error_message']) {
        let message = data['error_message'];
        let title = "Kickstart Error";
        let option1 = "Cancel";
        let option2 = "Continue";
        this.matDialog.open(ConfirmDailogComponent, {
          width: '35%',
          data: { "paneString": message, "paneTitle": title, "option1": option1, "option2": option2 },
        }).afterClosed().subscribe(response => {
          if (response == option2) {
            this.continueMIPAnyways(kickstartForm);
          }
        });
      } else {
        this.openKickstartConsole()
      }
    });
  }

}
