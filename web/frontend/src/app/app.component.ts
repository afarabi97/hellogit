import { Component, HostBinding, AfterContentInit } from '@angular/core';
import { OverlayContainer} from '@angular/cdk/overlay';
import { WeaponSystemNameService } from './services/weapon-system-name.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterContentInit {
  title = 'app';
  theme = null;

  classForSystemName = {
    'DIP': 'dip-theme',
    'MIP': 'mip-theme',
    'GIP': 'gip-theme'
  };

  constructor(private overlayContainer: OverlayContainer, private sysNameSrv: WeaponSystemNameService) {
  }

  @HostBinding('class') componentCssClass;

  ngAfterContentInit() {
    let system_name = this.sysNameSrv.getSystemName();
    let newTheme = this.classForSystemName[system_name];

    if(this.theme) {
      this.overlayContainer.getContainerElement().classList.replace(this.theme, newTheme);
      this.componentCssClass = newTheme;
    } else {
      this.overlayContainer.getContainerElement().classList.add(newTheme);
      this.componentCssClass = newTheme;
    }
  }
}
