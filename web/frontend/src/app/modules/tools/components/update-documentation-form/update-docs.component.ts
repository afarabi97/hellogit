import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '../../../../services/user.service';
import { TopNavbarComponent } from '../../../../top-navbar/top-navbar.component';
import { ToolsService } from '../../services/tools.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-update-docs-form',
  templateUrl: './update-docs.component.html',
  styleUrls: ['./update-docs.component.css']
})
export class UpdateDocsFormComponent implements OnInit {

  zipToUpload: File = null;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  spaceFormControl: FormControl;
  matcher: MyErrorStateMatcher;
  constructor(private snackBar: MatSnackBar,
    private toolSrv: ToolsService,
    private userService: UserService,
    private navbar: TopNavbarComponent ) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.spaceFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z]{1,50}$')
    ]);
    this.matcher = new MyErrorStateMatcher();
  }

  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  uploadFile() {
    console.log(this.spaceFormControl.value);

    this.displaySnackBar('Loading ' + this.zipToUpload.name + '...');
    this.toolSrv.uploadDocumentation(this.zipToUpload, this.spaceFormControl.value).subscribe(data => {
      this.displayServiceResponse(data);
    });
  }

  handleFileInput(files: FileList) {
    this.zipToUpload = files.item(0);
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  private displayServiceResponse(data: any) {
    if (data['success_message']) {
      this.displaySnackBar(data['success_message']);
      this.spaceFormControl.reset();
      this.zipToUpload = null;
      this.navbar.buildNavBar();
    } else if (data['error_message']) {
      this.displaySnackBar(data['error_message']);
    } else {
      this.displaySnackBar('Failed for unknown reason');
    }
  }

  private displaySnackBar(message: string, duration_seconds: number = 60) {
    this.snackBar.open(message, 'Close', { duration: duration_seconds * 1000 });
  }
}
