import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { remove_styles_from_dom } from '../../static-data/functions/clean-dom.function';
import { AppComponent } from './app.component';
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { TestingModule } from './modules/testing-modules/testing.module';
import { InjectorModule } from './modules/utilily-modules/injector.module';
import { MaterialModule } from './modules/utilily-modules/material.module';
import { ApiService } from './services/abstract/api.service';
import { CookieService } from './services/cookies.service';
import { ToolsService } from './tools-form/services/tools.service';
import { NavBarService } from './top-navbar/services/navbar.service';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        TestingModule,
        RouterModule,
        InjectorModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        AppComponent,
        TopNavbarComponent,
        NotificationsComponent
      ],
      providers: [
        CookieService,
        NavBarService,
        ApiService,
        SnackbarWrapper,
        FormBuilder,
        ToolsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Detect changes
    fixture.detectChanges();
  });

  afterAll(() => remove_styles_from_dom());

  it('should create AppComponent', () => {
    expect(component).toBeTruthy();
  });

});
