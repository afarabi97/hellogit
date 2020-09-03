import { Component, OnInit } from '@angular/core';
import { FormControl, AbstractControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolsService } from '../tools.service';
import { UserService } from '../../user.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormGroupControls } from 'src/app/validators/generic-validators.validator';
import { FormControls } from 'src/app/catalog/interface/chart.interface';
import { TopNavbarComponent } from '../../top-navbar/top-navbar.component';

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
  constructor(private snackBar: MatSnackBar,
    private toolSrv: ToolsService,
    private userService: UserService,
    private navbar: TopNavbarComponent ) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.spaceFormControl = new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern('^[a-zA-Z]*$')
    ]);
    let matcher = new MyErrorStateMatcher();
  }

  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60) {
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000 })
  }

  uploadFile() {
    console.log(this.spaceFormControl.value);

    this.displaySnackBar("Loading " + this.zipToUpload.name + "...");
    this.toolSrv.uploadDocumentation(this.zipToUpload, this.spaceFormControl.value).subscribe(data => {
      this.displayServiceResponse(data);
    });
  }

  private displayServiceResponse(data: any) {
    if (data['success_message']) {
      this.displaySnackBar(data['success_message']);
      this.navbar.buildNavBar();
    } else if (data['error_message']) {
      this.displaySnackBar(data['error_message']);
    } else {
      this.displaySnackBar("Failed for unknown reason");
    }
  }

  handleFileInput(files: FileList) {
    this.zipToUpload = files.item(0);
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}
