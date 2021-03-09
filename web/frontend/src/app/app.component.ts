import { OverlayContainer } from '@angular/cdk/overlay';
import { AfterContentInit, Component, HostBinding } from '@angular/core';

import { ObjectUtilitiesClass } from './classes';
import { ClassForSystemNameEnum } from './enums';
import { WeaponSystemNameService } from './services/weapon-system-name.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterContentInit {
  // Css class reference hostbinding
  @HostBinding('class') componentCssClass: string;
  // theme for application
  theme = null;

  /**
   * Creates an instance of AppComponent.
   *
   * @param {OverlayContainer} overlayContainer_
   * @param {WeaponSystemNameService} weaponSystemNameService_
   * @memberof AppComponent
   */
  constructor(private overlayContainer_: OverlayContainer,
              private weaponSystemNameService_: WeaponSystemNameService) {}

  /**
   * Used for seting the theme based on system name
   *
   * @memberof AppComponent
   */
  ngAfterContentInit(): void {
    const systemName: string = this.weaponSystemNameService_.getSystemName();
    const newTheme: string = ClassForSystemNameEnum[systemName];
    const containerElement: HTMLElement = this.overlayContainer_.getContainerElement();

    if (ObjectUtilitiesClass.notUndefNull(this.theme)) {
      containerElement.classList.replace(this.theme, newTheme);
    } else {
      containerElement.classList.add(newTheme);
    }
    this.theme = newTheme;
    this.componentCssClass = newTheme;
  }
}
