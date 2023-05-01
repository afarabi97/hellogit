import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';

import { KitTokenClass, SuccessMessageClass } from '../../../../classes';
import { DIALOG_WIDTH_800PX, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK } from '../../../../constants/cvah.constants';
import { KitTokenInterface } from '../../../../interfaces';
import { KitTokenSettingsService } from '../../services/kit-token-settings.service';
import { AddKitTokenComponent } from './components/add-kit-token-dialog/add-kit-token.component';
import { CopyTokenModalDialogComponent } from './components/copy-token-dialog/copy-token-dialog.component';
import { MatSnackBarService } from 'src/app/services/mat-snackbar.service';

@Component({
  selector: 'app-kit-token-settings-pane',
  templateUrl: './kit-token-settings-pane.component.html',
})
export class KitTokenSettingsPaneComponent implements OnInit {
  @Input() gipBuild: boolean;
  @Input() disable_add_kit_button: boolean;
  @ViewChild('KitTokenTable') kit_token_table: MatTable<KitTokenClass>;
  is_card_visible: boolean = false;
  kit_token_table_columns = ['ipaddress', 'actions'];
  kit_tokens: Array<KitTokenClass> = [];

  constructor(private kit_token_settings_service: KitTokenSettingsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mat_snackbar_service_: MatSnackBarService) {}

  ngOnInit() {
    this.kit_token_settings_service.get_kit_tokens().subscribe(kit_tokens => {
        this.kit_tokens = kit_tokens;
    });
  }

  toggle_card() {
    this.is_card_visible = !this.is_card_visible;
  }

  create_token(kit_token: KitTokenInterface) {
    this.kit_token_settings_service.create_kit_token(kit_token)
      .subscribe(token => {
          this.kit_tokens.push(token);
          this.kit_token_table.renderRows();
          this.snackBar.open(`Token Generated for Kit ${kit_token.ipaddress}`, 'OK', {duration: 5000});
      });
  }

  delete_token(kit_token_id) {
    this.kit_token_settings_service.delete_kit_token(kit_token_id).subscribe((response: SuccessMessageClass) => {
      this.mat_snackbar_service_.generate_return_success_snackbar_message(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
      this.kit_tokens = this.kit_tokens.filter(kit_token => kit_token.kit_token_id !== kit_token_id);
    });
  }

  add_kit_token_dialog() {
    const dialogRef = this.dialog.open(AddKitTokenComponent, {width: DIALOG_WIDTH_800PX});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.create_token(result);
      }
    });
  }

  display_token(kit_token: KitTokenInterface): void {
      this.dialog.open(CopyTokenModalDialogComponent,{
        minWidth: '400px',
        data: { 'title': `Kit Token: ${kit_token.ipaddress}`, 'token': kit_token.token }
      });
  }
}
