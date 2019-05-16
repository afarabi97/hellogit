import { FormGroup } from '@angular/forms';
import { HtmlInput } from '../html-elements';


export class AddConfigDataForm extends FormGroup {    

  constructor() {
      super({});
      super.addControl('name', this.name);
  }

  name = new HtmlInput(
      'name',
      'Config Map Data Name',
      '',
      'text',
      '^.{3,}$',
      'You must enter a name with a minimum length of 3 characters.',
      true,
      '',
      "The name of the config data map."
  )
}

export class AddConfigMapForm extends FormGroup {    

    constructor() {
        super({});
        super.addControl('namespace', this.namespace);
        super.addControl('name', this.name);
    }
  
    namespace = new HtmlInput(
        'name',
        'Config Map Namespace',
        '',
        'text',
        '^.{3,}$',
        'You must enter a name with a minimum length of 3 characters.',
        true,
        'default',
        "The name of the config map namepsace."
    )

    name = new HtmlInput(
        'name',
        'Config Map Name',
        '',
        'text',
        '^.{3,}$',
        'You must enter a name with a minimum length of 3 characters.',
        true,
        '',
        "The name of the config map."
    )
  }
