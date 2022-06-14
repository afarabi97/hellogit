import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { GeneralSettingsClass, KitSettingsClass, KitStatusClass } from '../../classes';
import { KitSettingsService } from '../../services/kit-settings.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css']
})
export class SystemSettingsComponent implements OnInit {
  generalSettings: Partial<GeneralSettingsClass> = {};
  kitSettings: Partial<KitSettingsClass> = {};
  kitStatus: Partial<KitStatusClass> = {};
  controllerInfo: any = {};

  constructor(private title: Title,
          private kitSettingsSrv: KitSettingsService) { }

  ngOnInit() {
    this.title.setTitle('System Settings');
    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettingsClass) => {
      this.generalSettings = data;
    });
    this.kitSettingsSrv.getKitStatus().subscribe((data: KitStatusClass) => {
      this.kitStatus = data;
    });

    this.kitSettingsSrv.getControllerInfo().subscribe(data => {
      this.controllerInfo = data;
    });
  }

  public updateGeneralSettings(value: GeneralSettingsClass): void {
    this.generalSettings = value;
  }

  public updateKitSettings(value: KitSettingsClass): void {
    this.kitSettings = value;
  }
}
