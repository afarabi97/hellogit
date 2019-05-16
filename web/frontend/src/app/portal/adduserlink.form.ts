import { FormGroup, ValidationErrors } from '@angular/forms';
import { HtmlInput } from '../html-elements';
import { NON_ISO_URL_CONSTRAINT } from '../frontend-constants';
import { UserLinkInterface } from '../portal.service';

export class AddUserLinkForm extends FormGroup {    


  constructor(links: Array<UserLinkInterface>) {
      super({});
      this.links = links;
      super.addControl('name', this.name);
      super.addControl('url', this.url);
      super.addControl('description', this.description);
      this.name.setValidators(this.nameValidator);
      this.url.setValidators(this.urlValidator);
  }

  /**
   * Check to see if a user link containing an element matching the parameters 
   * passed in exists.
   * @param param   Name of element to be checked
   * @param val     Value of the element
   * @returns   True if there is a link containing param:val, false otherwise
   */
  hasLink(param: string, val: string) : boolean {
    for(let link of this.links) {
        if(link[param] === val) {
              return true;
        } 
      }
      return false;
  }

  /**
   * Validator function for user link names.
   * @param linkForm    Form to be validated.
   * @returns   True if the name is three or more character and no other link
   * has that name. 
   */
  nameValidator = (linkForm: HtmlInput) : ValidationErrors | null => {
    let name = linkForm.value;
    if(name.length < 3) {
        return { 'name too short': name.length };
    }

    if(this.hasLink('name', name)) {
        return { 'name in use': name };
    }

    return null;
  }

  /**
   * Validator function for user link URLs
   * @param linkForm    Form to be validated
   * @returns True if the form contains a valid URL that is not currently in
   * the user-defined links.
   */
  urlValidator = (linkForm: HtmlInput) : ValidationErrors | null => {
      let url = linkForm.value;
      if(this.hasLink('url', url)) {
        return { 'name in use': url };
      }
      let urlCheck = new RegExp(NON_ISO_URL_CONSTRAINT);
      if(!urlCheck.test(url)){
        return { 'invalid': url };
      }
      return null
  }

  links: Array<UserLinkInterface>;

  name = new HtmlInput(
        'name',
        'Link Name',
        '',
        'text',
        '',//this.nameValidator
        'You must enter a name with a minimum length of 3 characters and not in use.',
        true,
        '',
        "The name of the link.");

  url = new HtmlInput (
        'link_url',
        'Link URL',
        "Enter link URL here. For off-site links, start with 'http://' or 'https://', without quotation marks.",
        'text',
        '',//this.urlValidator
        'Invalid URL',
        true,
        "",
        "Enter link URL here. For off-site links, start with 'http://' or 'https://', without quotation marks.",
  )

  description = new HtmlInput(
      'description',
      'Link description',
      '',
      'text',
      '',
      '',
      false,
      '',
      "Describe what's at the link."
  )
}
