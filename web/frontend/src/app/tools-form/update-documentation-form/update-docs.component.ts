import { Component, OnInit } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolsService } from '../tools.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-update-docs-form',
  templateUrl: './update-docs.component.html',
  styleUrls: ['./update-docs.component.css']
})
export class UpdateDocsFormComponent implements OnInit {

  zipToUpload: File = null;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  constructor(private snackBar: MatSnackBar, private toolSrv: ToolsService, private userService: UserService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() { }

  toggleCard(){
    this.isCardVisible = !this.isCardVisible;
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  uploadFile(){
    this.displaySnackBar("Loading " + this.zipToUpload.name + "...");
    this.toolSrv.uploadDocumentation(this.zipToUpload).subscribe(data => {
      this.displayServiceResponse(data);
    });
  }

  private displayServiceResponse(data: any){
    if (data['success_message']){
      this.displaySnackBar(data['success_message']);
    } else if (data['error_message']){
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
