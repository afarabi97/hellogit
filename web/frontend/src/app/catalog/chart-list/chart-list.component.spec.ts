import { ChartListComponent } from './chart-list.component';
import { CardComponent } from '../card/card.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeBackgroundComponent } from '../node-background/node-background.component';
import { CapitalizeFirstPipe } from '../../custom-pipes/capitalize.pipe';
import { InjectorModule } from '../../utilily-modules/injector.module';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CatalogService } from '../services/catalog.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ChartListComponent', () => {
  let component: ChartListComponent;
  let fixture: ComponentFixture<ChartListComponent>;

  beforeEach(async(() => {
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

  it('should list chart', async(() => {
      const charts = [
        {
          "appVersion": "1.0.0",
          "application": "hive",
          "description": "TheHive is a scalable 4-in-1 open source and free Security Incident Response Platform.",
          "pmoSupported": true
        },
        {
          "appVersion": "7.3.1",
          "application": "logstash",
          "description": "Logstash is an open source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, transforms it, and then sends it to your favorite stash.",
          "pmoSupported": true
        },
        {
          "appVersion": "5.22.3",
          "application": "mattermost",
          "description": "Mattermost is a chat and file sharing platform",
          "pmoSupported": false
        },
        {
          "appVersion": "2.1.0",
          "application": "moloch",
          "description": "Large scale, open source, indexed packet capture and search.",
          "pmoSupported": true
        },
        {
          "appVersion": "2.1.0",
          "application": "moloch-viewer",
          "description": "Large scale, open source, indexed packet capture and search.",
          "pmoSupported": true
        },
        {
          "appVersion": "4.2.6",
          "application": "mongodb",
          "description": "NoSQL document-oriented database that stores JSON-like documents with dynamic schemas, simplifying the integration of data in content-driven applications.",
          "pmoSupported": true
        },
        {
          "appVersion": "1.11.4",
          "application": "niagra-files",
          "description": "Easy to use, powerful, and reliable system to process and distribute data",
          "pmoSupported": false
        },
        {
          "appVersion": "4.1.0",
          "application": "redmine",
          "description": "Redmine is a flexible project management web application.  Written using the Ruby on Rails framework, it is cross platform and cross-database.",
          "pmoSupported": false
        },
        {
          "appVersion": "3.2.2",
          "application": "rocketchat",
          "description": "Prepare to take off with the ultimate chat platform, experience the next level of team communications",
          "pmoSupported": true
        },
        {
          "appVersion": "4.1.4",
          "application": "suricata",
          "description": "Suricata is a free and open source, mature, fast and robust network threat detection engine.",
          "pmoSupported": true
        },
        {
          "appVersion": "3.0.0",
          "application": "zeek",
          "description": "Zeek (formerly known as Bro) is a powerful network analysis framework that is much different from the typical IDS you may know. Also provides Kafka and Zookeeper for message brokering.",
          "pmoSupported": true
        },
        {
          "appVersion": "2.3.81",
          "application": "wikijs",
          "description": "Modern Wiki based on NodeJS.",
          "pmoSupported": true
        },
      ];

      component.charts = charts;

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const debug: DebugElement = fixture.debugElement;
        const cards = debug.queryAll(By.directive(CardComponent));
        expect(cards.length).toEqual(11);

        for (let i in cards) {
          expect(cards[i].componentInstance.chart).toEqual(charts[i]);
        }
    })
  }));

});
