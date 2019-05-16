import { FormGroup } from "@angular/forms";
import { HtmlInput } from "./html-elements";

export class NamePassword extends FormGroup {

  user_name: HtmlInput;
  password: HtmlInput;

  constructor({
    user_name_placeholder = "User Name",
    user_name_description = "Enter your user name here",
    user_name_default = "account user name", 
    password_placeholder = "Password",
    password_description = "Enter your password name here",
    password_default = "account name" 
    }:{
    user_name_placeholder?: string;
    user_name_description?: string;
    user_name_default?: string;
    password_placeholder?: string;
    password_description?: string;
    password_default?: string; } ) {

    super({});

    this.user_name = new HtmlInput(
      'user_name',
      user_name_placeholder,
      user_name_description,
      'text',
      undefined,
      'Must enter a user name.',
      true,
      '',
      user_name_default);

    this.password = new HtmlInput(
      'password',
      password_placeholder,
      password_description,
      'password',
      undefined,
      'Must enter a password.',
      true,
      '',
      password_default);

    super.addControl('user_name', this.user_name);
    super.addControl('password', this.password);
  }
}
