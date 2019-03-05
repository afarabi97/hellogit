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

export function netmaskToCIDR(netmask: string): number {
    let ret_val = netmask.split('.').map(Number).map(part => (part >>> 0).toString(2)).join('');
    return ret_val.split('1').length - 1;
}

export function CIDRToNetmask(bitCount: number): string {
    let mask = [];
    for(let i = 0; i < 4; i++) {
        let n = Math.min(bitCount, 8);
        mask.push(256 - Math.pow(2, 8-n));
        bitCount -= n;
    }
    return mask.join('.');
}

function ipv4ToInt(ip: string): number{
    return ip.split('.').reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;
}

/**
 * Checks to see if a given IP address is within a subnet range.
 * 
 * @param ip - The IP we want to check to see if it is within a subnet. 
 * @param networkIP - The network IP EX: 192.168.1.0
 * @param netmask - The netmask of the subnet EX: 255.255.255.0
 */
export function isIpv4InSubnet(ip: string, networkIP: string, netmask: string): boolean {        
    const bits = netmaskToCIDR(netmask);
    const mask = ~(2 ** (32 - bits) - 1);
    return (ipv4ToInt(ip) & mask) === (ipv4ToInt(networkIP) & mask);
}
