import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { KitSettingsService } from '../services/kit-settings.service';
import { Settings, GeneralSettings, KitStatus } from '../models/kit';

const DIALOG_WIDTH = '800px';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css']
})
export class SystemSettingsComponent implements OnInit {
  generalSettings: Partial<GeneralSettings> = {};
  kitSettings: Partial<Settings> = {};
  kitStatus: Partial<KitStatus> = {};
  controllerInfo: any = {};

  constructor(private title: Title,
          private kitSettingsSrv: KitSettingsService) { }

  ngOnInit() {
    this.title.setTitle('System Settings');
    this.kitSettingsSrv.getGeneralSettings().subscribe((data: GeneralSettings) => {
      this.generalSettings = data;
    });
    this.kitSettingsSrv.getKitStatus().subscribe((data: KitStatus) => {
      this.kitStatus = data;
    });
    this.kitSettingsSrv.getKitSettings().subscribe((data: Settings) => {
      this.kitSettings = data;
    });
    this.kitSettingsSrv.getControllerInfo().subscribe(data => {
      this.controllerInfo = data;
    });
  }

  public updateGeneralSettings(value: GeneralSettings): void {
    this.generalSettings = value;
  }

  public updateKitSettings(value: Settings): void {
    this.kitSettings = value;
  }
}
