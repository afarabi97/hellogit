import { Injectable } from '@angular/core';
import { ChartClass } from '../classes';

@Injectable({
  providedIn: 'root'
})
export class SortingService {

  constructor() { }

  public alphanum(a,b) {
    return naturalSort(a, b);
  }

  public node_alphanum(a,b) {
    a = a['hostname'];
    b = b['hostname'];
    return naturalSort(a, b);
  }

  /**
   * Used for sorting rules by there rule name
   *
   * @param {*} a
   * @param {*} b
   * @returns
   * @memberof SortingService
   */
  public rule_alphanum(a,b) {
    a = a['ruleName'];
    b = b['ruleName'];

    return naturalSort(a, b);
  }

  /**
   * Used for sorting rule sets by there rule set name
   *
   * @param {*} a
   * @param {*} b
   * @returns
   * @memberof SortingService
   */
  public rule_set_alphanum(a,b) {
    a = a['name'];
    b = b['name'];

    return naturalSort(a, b);
  }

  /**
   * Used for sorting charts by application
   *
   * @param {ChartClass} a
   * @param {ChartClass} b
   * @return {*}
   * @memberof SortingService
   */
  chart_application_alphanum(a: ChartClass, b: ChartClass): any {
    return naturalSort(a.application, b.application);
  }
}

function naturalSort (a, b) {
  return a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true});
}
