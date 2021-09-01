import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';

import { ObjectUtilitiesClass } from './classes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Used for querying the document for theme
  readonly query_selection: string = 'link[rel=stylesheet][href^=dark-theme]';

  /**
   * Creates an instance of AppComponent.
   *
   * @param {Document} document_
   * @memberof AppComponent
   */
  constructor(@Inject(DOCUMENT) private document_: Document) {
    const link: Element | null = document_.querySelector(this.query_selection);
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(link)) {
      link.id = 'theme';
    }
  }
}
