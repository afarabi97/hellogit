import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PolicyManagementService } from '../services/policy-management.service';


@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.component.html',
  styleUrls: ['./policy-management.component.css']
})
export class PolicyManagementComponent implements OnInit {

  constructor(private title: Title,
              public policySrv: PolicyManagementService) {
  }

  ngOnInit() {
    this.title.setTitle("Rule Sets");
  }
}
