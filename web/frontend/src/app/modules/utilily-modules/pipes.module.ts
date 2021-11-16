import { NgModule } from '@angular/core';

import { CapitalizeFirstPipe } from '../../pipes/capitalize-first.pipe';

@NgModule({
  declarations: [
    CapitalizeFirstPipe
  ],
  exports: [
    CapitalizeFirstPipe
  ]
})
export class PipesModule { }
