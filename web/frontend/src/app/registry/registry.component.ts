import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RegistryService } from './registry.service';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.component.html',
  styleUrls: ['./registry.component.css']
})
export class RegistryComponent implements OnInit {
  registry;

  columnsForImages = ['name', 'tags', 'image_id', 'image_size']
  loading: boolean;
  uniqueHTMLID: string;

  constructor(private registrySrv: RegistryService,
              private title: Title) { }

  ngOnInit() {
    this.title.setTitle("Docker Registry");
    this.loading = true;
    this.registrySrv.getDockerRegistry().subscribe(data => {
      this.registry = data;
      this.loading = false;
    });
  }

/**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof RegistryComponent
   */
generateUniqueHTMLID(passedID: string): string {    return this.uniqueHTMLID ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

}
