import { OverlayContainer } from '@angular/cdk/overlay';
import { AfterContentInit, Component, HostBinding } from '@angular/core';

import { ObjectUtilsClass } from './classes';
import { ClassForSystemNameEnum } from './enums';
import { WeaponSystemNameService } from './services/weapon-system-name.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements AfterContentInit {
  // theme for application
  theme = null;
  // Css class reference hostbinding
  @HostBinding('class') componentCssClass: string;

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
    const system_name: string = this.weaponSystemNameService_.getSystemName();
    const newTheme: string = ClassForSystemNameEnum[system_name];
    const containerElement: HTMLElement = this.overlayContainer_.getContainerElement();

    ObjectUtilsClass.notUndefNull(this.theme) ?
      containerElement.classList.replace(this.theme, newTheme) :
      containerElement.classList.add(newTheme);
    this.componentCssClass = newTheme;
  }
}
