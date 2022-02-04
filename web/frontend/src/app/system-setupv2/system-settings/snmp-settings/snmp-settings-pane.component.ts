import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { KitSettingsService } from '../../services/kit-settings.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SnackbarWrapper } from '../../../classes/snackbar-wrapper';

@Component({
  selector: 'app-snmp-settings-pane',
  templateUrl: './snmp-settings-pane.component.html',
})
export class SNMPSettingsPaneComponent implements OnInit, OnChanges {
  @Input()
  gipBuild: boolean;

  is_card_visible: boolean = false;
  snmp_settings: FormGroup;

  constructor(
    private kit_settings_service: KitSettingsService,
    private fb: FormBuilder,
    private snackbar_wrapper: SnackbarWrapper
  ) {}

  ngOnInit() {
    this.kit_settings_service.getSNMPSettings()
      .subscribe(
        settings => {
          if (settings) {
            this.create_form_group(settings);
          } else {
            this.create_form_group();
          }
        },
        error => {
          this.snackbar_wrapper.showSnackBar('An error has occurred: ' + error.status + '-' + error.statusText, -1, 'Dismiss');
          this.create_form_group();
        }
      );
  }

  ngOnChanges() {
    if (!this.snmp_settings) {
      return;
    }
    if (this.gipBuild) {
      this.snmp_settings.enable();
    } else {
      this.snmp_settings.disable();
    }
  }

  toggle_card() {
    this.is_card_visible = !this.is_card_visible;
  }

  submit() {
    if (this.snmp_settings.valid) {
      this.kit_settings_service.saveSNMPSettings({
        'security_name': this.snmp_settings.value['security_name'],
        'auth_pass': btoa(this.snmp_settings.value['auth_pass']),
        'priv_pass': btoa(this.snmp_settings.value['priv_pass'])
      }).subscribe(data => {
        this.snackbar_wrapper.showSnackBar('SNMP Settings Successfully Saved', -1, 'Dismiss');
      });
    }
  }

  private create_form_group(settings?) {
    this.snmp_settings = this.fb.group({
      security_name: [settings ? settings['security_name'] : null, Validators.required],
      auth_pass: [settings ? settings['auth_pass'] : null, Validators.required],
      priv_pass: [settings ? settings['priv_pass'] : null, Validators.required]
    });
    if (!this.gipBuild) {
      this.snmp_settings.disable();
    }
  }
}
