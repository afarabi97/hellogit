import { Injectable } from '@angular/core';

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
}

function naturalSort (a, b) {
  return a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true})
}
