import { Component, OnInit } from '@angular/core';
import { KickstartInventoryForm, NodeFormGroup } from '../kickstart-form/kickstart-form';
import { ActivatedRoute } from '@angular/router';
import { KitInventoryForm, SensorForm, ServerForm } from '../kit-form/kit-form';
import { FormControl, FormArray } from '@angular/forms';
import { Title } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {
  kickstart: KickstartInventoryForm;
  kickstartNode: NodeFormGroup;
  kitForm: KitInventoryForm;
  kitServer: ServerForm;
  kitSensor: SensorForm;
  
  private fragment: string;
  
  constructor(private route: ActivatedRoute, private title: Title) {
    this.kickstart = new KickstartInventoryForm();
    this.kickstartNode = new NodeFormGroup(true);
    this.kitForm = new KitInventoryForm();
    this.kitServer = new ServerForm(null);
    this.kitSensor = new SensorForm(null);
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  objectKeys(obj: any){
    let ret_val = [];
    for (let item of Object.keys(obj)){
      if (obj[item] instanceof FormControl || obj[item] instanceof FormArray){
        ret_val.push(item);
      }
    }
    return ret_val;
  }

  ngOnInit() {
    this.title.setTitle("Help");
  }

  ngAfterViewInit() {
    if (this.fragment){      
      let elementRef = document.querySelector('#' + this.fragment);
      elementRef.scrollIntoView();
      setTimeout(() => {
        window.scrollBy(0, -80);        
      }, 1000);
    }
        
    $('.tooltip').remove();
  }
}
