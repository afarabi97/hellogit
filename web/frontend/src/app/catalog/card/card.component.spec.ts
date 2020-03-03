import { CardComponent } from './card.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeBackgroundComponent } from '../node-background/node-background.component';
import { CapitalizeFirstPipe } from '../../custom-pipes/capitalize.pipe';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardComponent, NodeBackgroundComponent, CapitalizeFirstPipe ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create chart with info', async(() => {
    const mockChart = {
      "appVersion": "7.3.1",
      "application": "logstash",
      "description": "Logstash is an open source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, transforms it, and then sends it to your favorite stash.",
      "pmoSupported": false
    };

    component.chart = mockChart;

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const debug: DebugElement = fixture.debugElement;
      const application = debug.query(By.css('h3')).nativeElement;
      const text = application.firstChild;
      expect(text.data).toEqual('Logstash');
    })
  
  }));

});

