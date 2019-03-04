import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { HelpPageInterface } from './html-elements';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';
import { HttpHeaders } from '@angular/common/http';

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
} 

function _instanceOfHelpPageInterface(object: any): object is HelpPageInterface{
    return 'label' in object;
}

/**
 * Checks for invalid controls and appends them to the passed in array list. 
 * 
 * @param control 
 * @param errors 
 */
export function CheckForInvalidControls(control: AbstractControl, errors: Array<string>){
    let someForm = control as FormGroup;
    for (let field in someForm.controls){
        const control = someForm.get(field);
        if (!(control instanceof FormControl)){
            CheckForInvalidControls(control, errors);
        }
        else if (!control.valid){
            if (_instanceOfHelpPageInterface(control)){
                errors.push('- ' + control.label + ' is invalid. Current value is set to ' + control.value);
            } else {
                errors.push('- ' + field + ' is invalid. Current value is set to ' + control.value);
            }            
        }
    }
}