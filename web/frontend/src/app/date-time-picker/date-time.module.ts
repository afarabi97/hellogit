import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DateTimeComponent } from './date-time.component';
import { MaterialModule } from '../utilily-modules/material-module';


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    declarations: [
        DateTimeComponent
    ],
    exports: [
        DateTimeComponent
    ],
    entryComponents: [DateTimeComponent],
    providers: [DatePipe]
})

export class DateTimeModule { }