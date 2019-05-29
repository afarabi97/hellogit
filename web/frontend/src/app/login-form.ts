import { FormGroup } from "@angular/forms";
import { HtmlInput } from "./html-elements";
import { IP_CONSTRAINT, INVALID_FEEDBACK_IP } from "./frontend-constants";
import { NamePassword } from "./name-password";

export class LoginForm extends FormGroup {

  server_ip: HtmlInput;
  name_password: NamePassword;
  user_name: HtmlInput;
  password: HtmlInput;

  constructor({
    ip_placeholder = "Server IP",
    ip_description = "Enter your server IP here",
    ip_default = "",
    name_placeholder = "User Name",
    name_description = "Enter your user name here",
    name_default = "account user name", 
    passwrd_placeholder = "Password",
    passwrd_description = "Enter your password name here",
    passwrd_default = "account name" 
    }:{
    ip_placeholder?: string;
    ip_description?: string;
    ip_default?: string;
    name_placeholder?: string;
    name_description?: string;
    name_default?: string;
    passwrd_placeholder?: string;
    passwrd_description?: string;
    passwrd_default?: string; } ) {

    super({});

    this.server_ip = new HtmlInput(
      'server_ip',
      ip_placeholder,
      ip_description,
      'text',
      IP_CONSTRAINT,
      INVALID_FEEDBACK_IP,
      true,
      ip_default,
      "The IP address of the server."
    );

    this.name_password = new NamePassword({
        user_name_placeholder: name_placeholder,
        user_name_description: name_description,
        user_name_default: name_default,
        password_placeholder: passwrd_placeholder,
        password_default: passwrd_default,
        password_description: passwrd_description });

    this.user_name = this.name_password.user_name;

    this.password = this.name_password.password;

    super.addControl('server_ip', this.server_ip);
    super.addControl('user_name', this.user_name);
    super.addControl('password', this.password);
  }
}
