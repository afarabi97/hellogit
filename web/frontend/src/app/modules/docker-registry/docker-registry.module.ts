import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../utilily-modules/material.module';
import { DockerRegistryComponent } from './docker-registry.component';
import { DockerRegistryService } from './services/docker-registry.service';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  declarations: [
    DockerRegistryComponent
  ],
  exports: [
    DockerRegistryComponent
  ],
  providers: [
    DockerRegistryService
  ]
})
export class DockerRegistryModule { }
