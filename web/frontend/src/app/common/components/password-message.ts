import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-password-message',
  template: `<p style="margin: 0px;">
  Passwords must meet the following requirements:
</p>
<ol>
  <li>Minimum of 15 characters.</li>
  <li>At least 1 digit.</li>
  <li>At least 1 lowercase letter.</li>
  <li>At least 1 uppercase letter.</li>
  <li>At least 1 symbol.</li>
  <li>At least 8 unique characters.</li>
  <li>Must not have 3 consecutive characters that are the same.</li>
</ol>`
})
export class PasswordMessage implements OnInit {
  constructor() {
  }

  ngOnInit() {

  }
}
