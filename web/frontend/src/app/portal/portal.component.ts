import { Component, OnInit } from '@angular/core';
import { PortalService, UserLinkInterface } from './portal.service';
import { Title } from '@angular/platform-browser';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component'
import { DialogFormControl } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { validateFromArray } from '../validators/generic-validators.validator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../user.service';

const DIALOG_WIDTH = "800px";
const DIALOG_MAX_HEIGHT = "800px";

export const target_config_validators = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  url: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: "Link must start with either 'http://' or 'https://' without quotation marks.",
      validatorFn: 'pattern', ops: { pattern: /^(http:[/][/])|(https:[/][/])/ } }
  ]
}

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})
export class PortalComponent implements OnInit {
  links: Array<UserLinkInterface>;
  user_links: Array<UserLinkInterface>;
  gonerLink: UserLinkInterface;
  operator: boolean;

  constructor(private portalSrv: PortalService,
              private title: Title,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private snackBar: MatSnackBar,
              private userService: UserService) {
    this.links = new Array();
    this.user_links = new Array();
    this.operator = this.userService.isOperator();
  }

  ngOnInit() {
    this.title.setTitle("Portal");
    let state = history.state;
    if(state['action'] && state['action'] == 'unauthorized_route') {
      this.displaySnackBar("Unauthorized. You do not have access to " + state['route_name']);
    }
    this.portalSrv.getPortalLinks().subscribe((data: any) => {
      this.links = data;
    });
    this.portalSrv.getUserLinks().subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  saveUserLink(form: any) {
    this.portalSrv.addUserLink(form).subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  addUserLink() {
    let dialogForm = this.fb.group({
      name: new DialogFormControl("Link Name", '',
            Validators.compose([validateFromArray(target_config_validators.required)])),
      url: new DialogFormControl("Link URL", '',
            Validators.compose([validateFromArray(target_config_validators.url)])),
      description: new DialogFormControl("Link description", '',
            Validators.compose([validateFromArray(target_config_validators.required)])),
    });

    let dialogData = { title: "Add Link",
                       instructions: "Please enter link data",
                       dialogForm: dialogForm,
                       confirmBtnText: "Submit" }

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      let form = result as FormGroup;
      if (form && form.valid){
        this.saveUserLink(form.getRawValue());
      }
    });

  }

  openConfimRemoveUserLink($event, link: Object) {
    $event.stopPropagation();
    this.gonerLink = link as UserLinkInterface;

    let title = 'Remove Link "' + this.gonerLink.name + '"';
    let message = 'Confirm deletion of link to ' + this.gonerLink.url + '. This action cannot be undone.';

    let option1 = "Cancel";
    let option2 = "Delete";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result === option2) {
        this.removeUserLink();
      }
    });
  }
  removeUserLink() {
    this.portalSrv.removeUserLink(this.gonerLink).subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  getIcon(url: string) {
    return `${url}/favicon.ico`;
  }

  onViewUrl(url: string) {
    window.open(
      url,
      '_blank'
    );
  }
}
