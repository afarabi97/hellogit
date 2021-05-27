import { OverlayContainer } from '@angular/cdk/overlay';
import { AfterContentInit, Component, HostBinding } from '@angular/core';

import { ObjectUtilitiesClass } from './classes';

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
   * @memberof AppComponent
   */
  constructor(private overlayContainer_: OverlayContainer) {}

  /**
   * Used for seting the theme based on system name
   *
   * @memberof AppComponent
   */
  ngAfterContentInit(): void {
    const newTheme: string = 'dip-theme';
    const containerElement: HTMLElement = this.overlayContainer_.getContainerElement();

    ObjectUtilitiesClass.notUndefNull(this.theme) ?
      containerElement.classList.replace(this.theme, newTheme) :
      containerElement.classList.add(newTheme);
    this.theme = newTheme;
    this.componentCssClass = newTheme;
  }
}
