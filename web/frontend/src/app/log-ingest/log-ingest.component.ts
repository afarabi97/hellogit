import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { MatSelectChange } from '@angular/material/select';


import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { WINLOGBEAT_DEFAULT_PASSWORD_LABEL } from './constants/log-ingest.constant';
import { LogIngestService } from './log-ingest.service';
import { FilebeatModule } from './log-ingest.classes';


const DIALOG_WIDTH = '800px';


@Component({
    selector: 'app-log-ingest',
    templateUrl: './log-ingest.component.html',
    styleUrls: ['./log-ingest.component.css']
  })
export class LogIngestComponent implements OnInit {
  logToUpload: File;
  logForm: FormGroup;
  filesets: Array<{name: string, value: string, tooltip: string}>;
  modules: Array<FilebeatModule>;

  constructor(private title: Title,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              private ingestSrv: LogIngestService) {
  }

  ngOnInit() {
    this.title.setTitle("LogIngest");
    this.initializeFormGroup();
    this.filesets = [];

    this.modules = [];
    this.ingestSrv.getModuleInfo().subscribe(data => {
      for (let i of data as []){
        this.modules.push(new FilebeatModule(i))
      }
    });
  }

  handleFileInput(files: FileList) {
    this.logToUpload = files.item(0);
  }

  initializeFormGroup() {
    this.logForm = this.formBuilder.group({
      module: new FormControl('', Validators.required),
      index_suffix: new FormControl("cold-log", [Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9\-\_]+$')]),
      send_to_logstash: new FormControl(),
      fileset: new FormControl('')
    });
  }

  uploadFile() {
    this.ingestSrv.postFile(this.logToUpload, this.logForm.value).subscribe(data => {
      if (data["error_message"]){
        this.ingestSrv.displaySnackBar(data["error_message"]);
      } else {
        this.ingestSrv.displaySnackBar(`Successfully uploaded ${this.logToUpload.name}.
                                        Open the notification manager to track its progress.`);
      }
    }, error => {
      this.ingestSrv.displaySnackBar("Failed to initiate upload for an unknown reason.");
      console.error(error);
    });
  }

  /*
  Means
  */
  isFilesetsEmpty(): boolean{
    return this.filesets.length === 0;
  }

  moduleChange(event: MatSelectChange){
    this.filesets = [];
    for (const item of this.modules){
      if (item.value === event.value){
        if (item.filesets.length > 1){
          this.filesets = item.filesets;
        }
      }
    }
  }

  setupWinlogBeat() {
    this.ingestSrv.getWinlogbeatConfiguration().subscribe(data => {
      let instructions = "Please fill out the form.";
      if (data["windows_host"]){
        instructions = "Winlogbeat is already setup but you may re run the setup if there is a problem."
      }

      const windowsHostSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      windowsHostSpaceFormControlConfig.label = 'Hostname or IP Address';
      windowsHostSpaceFormControlConfig.formState = data['windows_host'] ? data['windows_host'] : '';
      windowsHostSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      const usernameSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      usernameSpaceFormControlConfig.label = 'Username';
      usernameSpaceFormControlConfig.formState = data['username'] ? data['username'] : '';
      usernameSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      const passwordSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      passwordSpaceFormControlConfig.label = WINLOGBEAT_DEFAULT_PASSWORD_LABEL;
      passwordSpaceFormControlConfig.formState = data['password'] ? data['password'] : '';
      passwordSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      passwordSpaceFormControlConfig.asyncValidator = undefined;
      passwordSpaceFormControlConfig.tooltip = undefined;
      passwordSpaceFormControlConfig.controlType = DialogControlTypes.password;
      const winrmPortSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      winrmPortSpaceFormControlConfig.label = 'WinRM Port';
      winrmPortSpaceFormControlConfig.formState = data['winrm_port'] ? data['winrm_port'] : 5985;
      winrmPortSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      const winrmSchemeSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      winrmSchemeSpaceFormControlConfig.label = 'WinRM Scheme';
      winrmSchemeSpaceFormControlConfig.formState = data['winrm_scheme'] ? data['winrm_scheme'] : 'http';
      winrmSchemeSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      winrmSchemeSpaceFormControlConfig.asyncValidator = undefined;
      winrmSchemeSpaceFormControlConfig.tooltip = undefined;
      winrmSchemeSpaceFormControlConfig.controlType = DialogControlTypes.dropdown;
      winrmSchemeSpaceFormControlConfig.options = ['http', 'https'];
      const winrmTransportSpaceFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      winrmTransportSpaceFormControlConfig.label = 'WinRM Transport';
      winrmTransportSpaceFormControlConfig.formState = data['winrm_transport'] ? data['winrm_transport'] : 'ntlm';
      winrmTransportSpaceFormControlConfig.validatorOrOpts = [Validators.required];
      winrmTransportSpaceFormControlConfig.asyncValidator = undefined;
      winrmTransportSpaceFormControlConfig.tooltip = undefined;
      winrmTransportSpaceFormControlConfig.controlType = DialogControlTypes.dropdown;
      winrmTransportSpaceFormControlConfig.options = ['ntlm', 'basic'];
      const winlogBeatSetupForm = this.formBuilder.group({
        windows_host: new DialogFormControl(windowsHostSpaceFormControlConfig),
        username: new DialogFormControl(usernameSpaceFormControlConfig),
        password: new DialogFormControl(passwordSpaceFormControlConfig),
        winrm_port: new DialogFormControl(winrmPortSpaceFormControlConfig),
        winrm_scheme: new DialogFormControl(winrmSchemeSpaceFormControlConfig),
        winrm_transport: new DialogFormControl(winrmTransportSpaceFormControlConfig),
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
          const form = result as FormGroup;
          if(form && form.valid) {
            this.ingestSrv.setupWinlogbeat(form.value).subscribe(data => {
              console.log(data);
              this.ingestSrv.displaySnackBar(`Successfully Kicked off Winlogbeat setup for Cold Log Ingest.
                                              Open the notification manager to track its progress.`);
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
