import { Component, OnInit } from '@angular/core';
import { PortalService, UserLinkInterface } from '../portal.service';
import { Title } from '@angular/platform-browser';
import { HtmlModalPopUp, ModalType } from '../html-elements';
import { AddUserLinkForm } from './adduserlink.form';


@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.css']
})

export class PortalComponent implements OnInit {
  links: Array<UserLinkInterface>;
  user_links: Array<UserLinkInterface>;
  addUserLinkModal: HtmlModalPopUp;
  removeUserLinkModal: HtmlModalPopUp;
  gonerLink: UserLinkInterface;

  constructor(private portalSrv: PortalService, private title: Title) {
    this.links = new Array();
    this.user_links = new Array();
    this.addUserLinkModal = new HtmlModalPopUp('adduserlink_modal');
    this.removeUserLinkModal = new HtmlModalPopUp('removeuserlink_modal');
  }

  ngOnInit() {
    this.title.setTitle("Portal");
    this.portalSrv.getPortalLinks().subscribe((data: any) => {
      this.links = data;
    });
    this.portalSrv.getUserLinks().subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  saveUserLink(form: any) {
    this.portalSrv.addUserLink(form).subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  addUserLink() {
    this.addUserLinkModal.updateModal(
      "Add Link", "Please enter link data.", "Submit", "Cancel", ModalType.form, new AddUserLinkForm(this.user_links));
    this.addUserLinkModal.openModal();
  }

  openConfimRemoveUserLink($event, link: Object) {
    $event.stopPropagation();
    this.gonerLink = link as UserLinkInterface;
    this.removeUserLinkModal.updateModal(
      'Remove Link "' + this.gonerLink.name + '"', 'Confirm deletion of link to ' + this.gonerLink.url
      + '. This action cannot be undone.', 'Delete', 'Cancel');
    this.removeUserLinkModal.openModal();
  }
  removeUserLink() {
    this.portalSrv.removeUserLink(this.gonerLink).subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }

  public getWinlogbeatDashboard(ip: string): string {
    return `${ip}/app/kibana#/dashboard/2a387ff0-3620-11e9-9e90-99a51a8d0304?_g=()&_a=(description:'',filters:!(),fullScreenMode:!f,options:(darkTheme:!t,hidePanelTitles:!f,useMargins:!t),panels:!((embeddableConfig:(vis:(legendOpen:!t)),gridData:(h:19,i:'1',w:48,x:0,y:63),id:'4556e2a0-3601-11e9-9e90-99a51a8d0304',panelIndex:'1',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:19,i:'3',w:48,x:0,y:82),id:'9bc25820-361c-11e9-9e90-99a51a8d0304',panelIndex:'3',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:18,i:'4',w:48,x:0,y:45),id:c158c590-361e-11e9-9e90-99a51a8d0304,panelIndex:'4',title:Tasks,type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:5,i:'5',w:12,x:12,y:0),id:a7fdd1a0-36e9-11e9-9e90-99a51a8d0304,panelIndex:'5',title:'Filter%20by%20User%20Name',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:5,i:'6',w:12,x:0,y:0),id:'7e282c80-36ea-11e9-9e90-99a51a8d0304',panelIndex:'6',title:'Filter%20by%20Computer%20Name',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:5,i:'7',w:12,x:24,y:0),id:e86df110-3910-11e9-9e90-99a51a8d0304,panelIndex:'7',title:'Filter%20by%20Task',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:5,i:'9',w:12,x:36,y:0),id:'70000650-391f-11e9-9c7c-59022587a619',panelIndex:'9',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:6,i:'10',w:48,x:0,y:5),id:'479e9860-3925-11e9-9c7c-59022587a619',panelIndex:'10',title:'Count%20Timeline',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:18,i:'11',w:48,x:0,y:11),id:'13289ce0-3aae-11e9-9d88-e56b0c1a8afa',panelIndex:'11',type:visualization,version:'6.5.3'),(embeddableConfig:(),gridData:(h:16,i:'12',w:48,x:0,y:29),id:'714772d0-3c32-11e9-9adf-7d591fd25609',panelIndex:'12',title:'Critical,%20Error,%20Warning%20Timeline',type:visualization,version:'6.5.3')),query:(language:kuery,query:''),timeRestore:!f,title:Winlogbeat,viewMode:view)`
  }

  public getBroDashboard(ip: string): string {
    return `${ip}/app/kibana#/dashboard/130017f0-46ce-11e7-946f-1bfb1be7c36b?_g=()&_a=(description:'',filters:!(),fullScreenMode:!f,options:(darkTheme:!t,useMargins:!t),panels:!((gridData:(h:24,i:'1',w:40,x:8,y:12),id:f86bc870-46ce-11e7-946f-1bfb1be7c36b,panelIndex:'1',type:visualization,version:'6.5.3'),(embeddableConfig:(vis:(params:(sort:(columnIndex:!n,direction:!n)))),gridData:(h:28,i:'2',w:12,x:8,y:36),id:'0f25aac0-3434-11e7-8867-29a39c0f86b2',panelIndex:'2',type:visualization,version:'6.5.3'),(gridData:(h:24,i:'4',w:48,x:0,y:64),id:'3a273780-46d0-11e7-946f-1bfb1be7c36b',panelIndex:'4',type:visualization,version:'6.5.3'),(gridData:(h:64,i:'9',w:8,x:0,y:0),id:b3b449d0-3429-11e7-9d52-4f090484f59e,panelIndex:'9',type:visualization,version:'6.5.3'),(embeddableConfig:(columns:!(_source),sort:!('@timestamp',desc)),gridData:(h:64,i:'10',w:48,x:0,y:88),id:ef487fd0-46cf-11e7-ba56-317a6969f55c,panelIndex:'10',type:search,version:'6.5.3'),(embeddableConfig:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)'))),gridData:(h:12,i:'15',w:8,x:8,y:0),id:AWDHIynExQT5EBNmq49q,panelIndex:'15',type:visualization,version:'6.5.3'),(embeddableConfig:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)'))),gridData:(h:12,i:'16',w:8,x:16,y:0),id:AWDHJY1BxQT5EBNmq5Ay,panelIndex:'16',type:visualization,version:'6.5.3'),(embeddableConfig:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)'))),gridData:(h:12,i:'17',w:8,x:24,y:0),id:AWDHJpuBxQT5EBNmq5Cr,panelIndex:'17',type:visualization,version:'6.5.3'),(embeddableConfig:(vis:(defaultColors:('0%20-%20100':'rgb(0,104,55)'))),gridData:(h:12,i:'18',w:8,x:32,y:0),id:AWDHKEF2xQT5EBNmq5FA,panelIndex:'18',type:visualization,version:'6.5.3'),(embeddableConfig:(vis:(params:(sort:(columnIndex:2,direction:desc)))),gridData:(h:28,i:'19',w:28,x:20,y:36),id:d8214de0-4a3a-11e8-9b0a-f1d33346f773,panelIndex:'19',type:visualization,version:'6.5.3')),query:(language:lucene,query:(query_string:(analyze_wildcard:!t,default_field:'*',query:'*'))),timeRestore:!f,title:Stats,viewMode:view)`
  }

  getIcon(url) {
    return `${url}/favicon.ico`;
  }

  onViewUrl(url) {
    location.href = url;
  }
}
