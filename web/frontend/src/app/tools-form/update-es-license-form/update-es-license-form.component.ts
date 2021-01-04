import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../services/user.service';
import { ToolsService } from '../services/tools.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-update-es-license-form',
  templateUrl: './update-es-license-form.component.html',
  styleUrls: ['./update-es-license-form.component.css']
})
export class UpdateEsLicenseComponent implements OnInit {

  fileToUpload: File = null;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  matcher: MyErrorStateMatcher;
  currentLicense: Object;
  constructor(private snackBar: MatSnackBar,
    private toolSrv: ToolsService,
    private userService: UserService,) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.matcher = new MyErrorStateMatcher();
    this.toolSrv.getEsLicense().subscribe(data => {
      this.currentLicense = data;
    });
  }

  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60) {
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000 });
  }

  uploadFile() {
    this.displaySnackBar("Loading " + this.fileToUpload.name + "...");
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let license = JSON.parse(fileReader.result as string);
      this.toolSrv.uploadEsLicense(license).subscribe(data => {
        this.displayServiceResponse(data);
      });
    }
    fileReader.readAsText(this.fileToUpload);
  }

  private displayServiceResponse(data: any) {
    if (data['success_message']) {
      this.displaySnackBar(data['success_message']);
      this.fileToUpload = null;
    } else if (data['error_message']) {
      this.displaySnackBar(data['error_message']);
    } else {
      this.displaySnackBar("Failed for unknown reason");
    }
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}
