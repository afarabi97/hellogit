import { Title } from '@angular/platform-browser';
import { PolicyManagementComponent } from './policy-management.component'
import { PolicyManagementService } from '../services/policy-management.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA }  from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('PolicyManagementComponent', () => {
  let component: PolicyManagementComponent
  let fixture: ComponentFixture<PolicyManagementComponent>;

beforeEach(async(() => {
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
