import { Component, OnInit } from '@angular/core';
import { DialogFormControl, DialogControlTypes } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LogIngestService } from './log-ingest.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';

const DIALOG_WIDTH = '800px';

@Component({
    selector: 'app-log-ingest',
    templateUrl: './log-ingest.component.html',
    styleUrls: ['./log-ingest.component.css']
  })
export class LogIngestComponent implements OnInit {
  logToUpload: File;
  logForm: FormGroup;

  constructor(private title: Title,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              private ingestSrv: LogIngestService) {
  }

  ngOnInit() {
    this.title.setTitle("LogIngest");
    this.initializeFormGroup();
  }

  handleFileInput(files: FileList) {
    this.logToUpload = files.item(0);
  }

  initializeFormGroup() {
    this.logForm = this.formBuilder.group({
      module: new FormControl('', Validators.required),
      index_suffix: new FormControl("cold-log", Validators.required),
      send_to_logstash: new FormControl()
    });
  }

  uploadFile() {
    this.ingestSrv.postFile(this.logToUpload, this.logForm.value).subscribe(data => {
      if (data["error_message"]){
        this.ingestSrv.displaySnackBar(data["error_message"]);
      } else {
        this.ingestSrv.displaySnackBar("Successfully uploaded " + this.logToUpload.name +
        ". Open the notification manager to track its progress.");
      }
    }, error => {
      this.ingestSrv.displaySnackBar("Failed to initiate upload for an unknown reason.");
      console.error(error);
    });
  }

  setupWinlogBeat() {
    this.ingestSrv.getWinlogbeatConfiguration().subscribe(data => {
      let instructions = "Please fill out the form.";
      if (data["windows_host"]){
        instructions = "Winlogbeat is already setup but you may re run the setup if there is a problem."
      }
      let winlogBeatSetupForm = this.formBuilder.group({
        windows_host: new DialogFormControl("Hostname or IP Address", data["windows_host"] ? data["windows_host"] : "", [Validators.required]),
        username: new DialogFormControl("Username", data["username"] ? data["username"] : "", [Validators.required]),
        password: new DialogFormControl("Password", data["password"] ? data["password"] : "", [Validators.required], undefined, undefined, DialogControlTypes.password),
        winrm_port: new DialogFormControl("WinRM Port", data["winrm_port"] ? data["winrm_port"] : 5985, [Validators.required]),
        winrm_scheme: new DialogFormControl("WinRM Scheme", data["winrm_scheme"] ? data["winrm_scheme"] : "http",
                                            [Validators.required],
                                            undefined,
                                            undefined,
                                            DialogControlTypes.dropdown,
                                            ["http", "https"]),
        winrm_transport: new DialogFormControl("WinRM Scheme", data["winrm_transport"] ? data["winrm_transport"] : "ntlm",
                                               [Validators.required],
                                               undefined,
                                               undefined,
                                               DialogControlTypes.dropdown,
                                               ["ntlm", "basic"]),
      });

      const dialogRef = this.dialog.open(ModalDialogMatComponent, {
        width: DIALOG_WIDTH,
        data: {
          title: "Setup Winlog Beat",
          instructions: instructions,
          dialogForm: winlogBeatSetupForm,
          confirmBtnText: "Submit"
        }
      });

      dialogRef.afterClosed().subscribe(
        result => {
          let form = result as FormGroup;
          if(form && form.valid) {
            this.ingestSrv.setupWinlogbeat(form.value).subscribe(data => {
              console.log(data);
              this.ingestSrv.displaySnackBar("Successfully Kicked off Winlogbeat setup for Cold Log Ingest. \
                                              Open the notification manager to track its progress.");
            }, error => {
              this.ingestSrv.displaySnackBar("Failed to initiate upload for an unknown reason.");
              console.error(error);
            });

          }
        }
      );
    });
  }
}
