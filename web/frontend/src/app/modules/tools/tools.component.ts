import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { TOOLS_FORM_COMPONENT_TITLE } from './constants/tools.constant';

/**
 * Component used for gather and displayting other child components with forms
 *
 * @export
 * @class ToolsFormComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'cvah-tools',
  templateUrl: './tools.component.html',
  styleUrls: [
    './tools.component.scss'
  ]
})
export class ToolsFormComponent implements OnInit {

  /**
   * Creates an instance of ToolsFormComponent.
   *
   * @param {Title} title_
   * @memberof ToolsFormComponent
   */
  constructor(private title_: Title) { }

  /**
   * Used for initial setup
   *
   * @memberof ToolsFormComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(TOOLS_FORM_COMPONENT_TITLE);
  }
}
