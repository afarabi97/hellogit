import { Injectable } from "@angular/core";
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  constructor(@Inject(DOCUMENT) private doc_: any) {}

  change_theme_(href: string) {
    this.doc_.getElementById("theme").href = href;
  }
}
