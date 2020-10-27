import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';

import { PolicyManagementService } from '../services/policy-management.service';
import { PolicyManagementComponent } from './policy-management.component';

describe('PolicyManagementComponent', () => {
  let component: PolicyManagementComponent
  let fixture: ComponentFixture<PolicyManagementComponent>;

beforeEach(waitForAsync(() => {
  TestBed.configureTestingModule({
  declarations: [ PolicyManagementComponent ],
  providers: [ PolicyManagementService, Title, { provide: MatSnackBar, useValue: null } ],
  imports: [ HttpClientTestingModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

});
