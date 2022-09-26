import { ObjectUtilitiesClass } from '../../../classes';
import { HitSourceRuleInterface } from '../interfaces';

/**
 * Class defines the Hit Source Rule
 *
 * @export
 * @class HitSourceRuleClass
 * @implements {HitSourceRuleInterface}
 */
export class HitSourceRuleClass implements HitSourceRuleInterface {
  name: string;
  category?: string;
  id?: string;

  /**
   * Creates an instance of HitSourceRuleClass.
   *
   * @param {HitSourceRuleInterface} hit_source_rule_interface
   * @memberof HitSourceRuleClass
   */
  constructor(hit_source_rule_interface: HitSourceRuleInterface) {
    this.name = hit_source_rule_interface.name;
    if (ObjectUtilitiesClass.notUndefNull(hit_source_rule_interface.category)) {
      this.category = hit_source_rule_interface.category;
    }
    if (ObjectUtilitiesClass.notUndefNull(hit_source_rule_interface.id)) {
      this.id = hit_source_rule_interface.id;
    }
  }
}
