import { Pipe, PipeTransform } from '@angular/core';

import { ObjectUtilitiesClass } from '../classes';

/*
 * Capitalize the first letter of the string
 * Takes a string as a value.
 * Usage:
 *  value | capitalizefirst
 * Example:
 *  // value.name = daniel
 *  {{ value.name | capitalizefirst  }}
 *  fromats to: Daniel
*/
@Pipe({
  name: 'capitalizeFirst'
})
export class CapitalizeFirstPipe implements PipeTransform {
  transform(value: string): string {
    return !ObjectUtilitiesClass.notUndefNull(value) ? 'Not assigned' : value.charAt(0).toUpperCase() + value.slice(1);
  }
}
