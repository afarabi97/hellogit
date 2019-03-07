import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConfluenceService }  from '../confluence.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {  
  spaces: Object;

  @ViewChild('navlist')
  navlist: ElementRef;
  
  constructor(private confluenceSrv: ConfluenceService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.confluenceSrv.getSpaces().subscribe(data => {
      this.spaces = data;
    });
  }

  clearPreviousActive(){
    if (this.navlist){
      let navChildren = this.navlist.nativeElement.children;
      for (let i = 0; i < navChildren.length; i++){        
        if (navChildren[i].children[0] !== undefined){
          if (navChildren[i].className.includes("dropdown")){
            navChildren[i].children[0]['className'] = "nav-link dropdown-toggle";
          } else {
            navChildren[i].children[0]['className'] = "nav-link";
          }
        }
      }
    }
  }

  setActive(event: any){
    this.clearPreviousActive();
    if (event){
      // Fixes a Firefox bug
      let srcElement = event.srcElement;
      if (srcElement === undefined){
        srcElement = event.target;
      }
      if (srcElement['className'].includes("dropdown")){
        srcElement['className'] = "nav-link dropdown-toggle active";
      } else {
        srcElement['className'] = "nav-link active";
      }
    }
  }
}
