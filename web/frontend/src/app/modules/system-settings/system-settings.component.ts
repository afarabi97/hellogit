import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ControllerInfoClass, GeneralSettingsClass, KitSettingsClass, KitStatusClass } from '../../classes';
import { KitSettingsService } from '../../services/kit-settings.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css']
})
export class SystemSettingsComponent implements OnInit {
  generalSettings: Partial<GeneralSettingsClass> = {};
  kitSettings: KitSettingsClass;
  kitStatus: Partial<KitStatusClass> = {};
  controllerInfo: Partial<ControllerInfoClass> = {};
  disable_add_kit_button: boolean;

  constructor(private title: Title,
          private kitSettingsSrv: KitSettingsService) {
    this.disable_add_kit_button = true;
  }

  ngOnInit() {
    this.title.setTitle('System Settings');
    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettingsClass) => {
      this.generalSettings = data;
    });
    this.kitSettingsSrv.get_kit_status().subscribe((data: KitStatusClass) => {
      this.kitStatus = data;
    });

    this.kitSettingsSrv.get_controller_info().subscribe((response: ControllerInfoClass) => {
      this.controllerInfo = response;
    });
    this.kitSettingsSrv.getKitSettings().subscribe((data: KitSettingsClass) => {
      this.kitSettings = data;
      this.disable_add_kit_button = false;
    });
  }

  public updateGeneralSettings(value: GeneralSettingsClass): void {
    this.generalSettings = value;
  }

  public updateKitSettings(value: KitSettingsClass): void {
    this.kitSettings = value;
  }

  update_add_kit_button(event: boolean): void {
    this.disable_add_kit_button = event;
  }

  check_is_gip(): boolean {
    return this.kitSettings?.is_gip;
  }
}
