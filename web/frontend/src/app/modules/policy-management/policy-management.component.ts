import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { RulesService } from '../../services/rules.service';
import { RULE_SETS_TITLE } from './constants/policy-management.constant';

/**
 * Component used for displaying policy instructions or policy management dialog
 *
 * @export
 * @class PolicyManagementComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-policy-management',
  templateUrl: './policy-management.component.html'
})
export class PolicyManagementComponent implements OnInit {
  // Used for showing instructions or dialog
  user_editing: boolean;

  /**
   * Creates an instance of PolicyManagementComponent.
   *
   * @param {Title} title_
   * @param {RulesService} rules_service_
   * @memberof PolicyManagementComponent
   */
  constructor(private title_: Title,
              private rules_service_: RulesService) {
    this.user_editing = false;
  }

  /**
   * Used for initial component set and subscriptions
   *
   * @memberof PolicyManagementComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(RULE_SETS_TITLE);
    this.rules_service_.get_is_user_editing()
      .pipe(untilDestroyed(this))
      .subscribe((response: boolean) => this.set_user_editing_(response));
  }

  /**
   * Sets the user editing value used in html
   *
   * @private
   * @param {boolean} value
   * @memberof PolicyManagementComponent
   */
  private set_user_editing_(value: boolean): void {
    this.user_editing = value;
  }
}
