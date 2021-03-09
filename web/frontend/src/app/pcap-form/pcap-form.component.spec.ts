import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PcapFormComponent } from './pcap-form.component';
import { PcapService } from '../services/pcap.service';

//describe the begining of test suite here
describe('Pcap loading', () => {
  let component: PcapFormComponent;
  let fixture: ComponentFixture<PcapFormComponent>;
  let httpTestingController: HttpTestingController;

beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
  declarations: [ PcapFormComponent ],
  providers: [PcapService, Title ],
  imports: [ MatDialogModule, MatCardModule, MatTableModule, HttpClientTestingModule, MatSnackBarModule, MatPaginatorModule, NoopAnimationsModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcapFormComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
