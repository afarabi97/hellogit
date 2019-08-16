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

  constructor(private registrySrv: RegistryService,
              private title: Title) { }

  ngOnInit() {
    this.title.setTitle("Docker Registry");
    this.registrySrv.getDockerRegistry().subscribe(data => {
      this.registry = data;
    });
  }

}
