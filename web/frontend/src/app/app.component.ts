import { Component, HostBinding } from '@angular/core';
import { OverlayContainer} from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'app';
  theme = null;

  classForSystemName = {
    'DIP': 'dip-theme',
    'MIP': 'mip-theme',
    'GIP': 'gip-theme'
  };

  constructor(private overlayContainer: OverlayContainer) {
  }

  @HostBinding('class') componentCssClass;

  setTheme(event) {
    let system_name = event['system_name'];
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
