import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { InjectorModule } from '../../modules/utilily-modules/injector.module';
import { CapitalizeFirstPipe } from '../../pipes/capitalize-first.pipe';
import { CardComponent } from '../card/card.component';
import { NodeBackgroundComponent } from '../node-background/node-background.component';
import { CatalogService } from '../services/catalog.service';
import { ChartListComponent } from './chart-list.component';

describe('ChartListComponent', () => {
  let component: ChartListComponent;
  let fixture: ComponentFixture<ChartListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartListComponent, CardComponent, NodeBackgroundComponent, CapitalizeFirstPipe ],
      providers: [ CatalogService, SnackbarWrapper],
      imports: [RouterTestingModule, InjectorModule, MatSnackBarModule, HttpClientTestingModule ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list chart', waitForAsync(() => {
      const charts = [
        {
          "appVersion": "4.0.5",
          "application": "hive",
          "description": "TheHive is a scalable 4-in-1 open source and free Security Incident Response Platform.",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "3.1.1",
          "application": "cortex",
          "description": "Cortex is a Powerful Observable Analysis and Active Response Engine.",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "7.8.1",
          "application": "logstash",
          "description": "Logstash is an open source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, transforms it, and then sends it to your favorite stash.",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "5.31.1",
          "application": "mattermost",
          "description": "Mattermost is a chat and file sharing platform",
          "pmoSupported": false,
          "isSensorApp": false
        },
        {
          "appVersion": "2.2.3v2",
          "application": "arkime",
          "description": "Large scale, open source, indexed packet capture and search.",
          "pmoSupported": true,
          "isSensorApp": true
        },
        {
          "appVersion": "2.2.3v2",
          "application": "arkime-viewer",
          "description": "Large scale, open source, indexed packet capture and search.",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "1.12.1",
          "application": "nifi",
          "description": "Easy to use, powerful, and reliable system to process and distribute data",
          "pmoSupported": false,
          "isSensorApp": false
        },
        {
          "appVersion": "4.1.1",
          "application": "redmine",
          "description": "Redmine is a flexible project management web application.  Written using the Ruby on Rails framework, it is cross platform and cross-database.",
          "pmoSupported": false,
          "isSensorApp": false
        },
        {
          "appVersion": "3.11.0",
          "application": "rocketchat",
          "description": "Prepare to take off with the ultimate chat platform, experience the next level of team communications",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "6.0.0",
          "application": "suricata",
          "description": "Suricata is a free and open source, mature, fast and robust network threat detection engine.",
          "pmoSupported": true,
          "isSensorApp": true
        },
        {
          "appVersion": "4.0.1",
          "application": "zeek",
          "description": "Zeek (formerly known as Bro) is a powerful network analysis framework that is much different from the typical IDS you may know. Also provides Kafka and Zookeeper for message brokering.",
          "pmoSupported": true,
          "isSensorApp": true
        },
        {
          "appVersion": "2.5.170",
          "application": "wikijs",
          "description": "Modern Wiki based on NodeJS.",
          "pmoSupported": true,
          "isSensorApp": false
        },
        {
          "appVersion": "2.4.139",
          "application": "misp",
          "description": "MISP is a malware information sharing platform",
          "pmoSupported": true,
          "isSensorApp": false
        },
      ];

      component.charts = charts;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const debug: DebugElement = fixture.debugElement;
        const cards = debug.queryAll(By.directive(CardComponent));
        expect(cards.length).toEqual(13);

        for (const i in cards) {
          if (cards.hasOwnProperty(i)) {
            expect(cards[i].componentInstance.chart).toEqual(charts[i]);
          }
        }
    });
  }));
});
