import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss']
})
export class TopNavbarComponent implements OnInit {
  public hostname: string;

  @ViewChild('navlist')
  navlist: ElementRef;


  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.hostname = window.location.hostname;
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
