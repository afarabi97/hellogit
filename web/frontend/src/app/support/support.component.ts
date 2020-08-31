import { Component, OnInit } from '@angular/core';
import { NavBarService } from '../top-navbar/navbar.service'
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {

  version: string;
  commit_hash: string;
  build_date: string;

  constructor(private navService: NavBarService,
              private title: Title)
  { }

  ngOnInit() {
    this.title.setTitle("PMO Support");
    this.navService.getVersion().subscribe(versionObj => {
      this.version = versionObj.version;
      this.commit_hash = versionObj.commit_hash
      this.build_date = versionObj.build_date
    });
  }
}
