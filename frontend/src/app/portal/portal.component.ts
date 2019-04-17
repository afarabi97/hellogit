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

  constructor(private portalSrv: PortalService, private title: Title) { 
    this.links = new Array();
    this.user_links = new Array();
    this.addUserLinkModal = new HtmlModalPopUp('adduserlink_modal');
    this.removeUserLinkModal = new HtmlModalPopUp('removeuserlink_modal');
  }

  ngOnInit() {
    this.title.setTitle("Portal");
    this.portalSrv.getPortalLinks().subscribe(data => {
      let portalLinks = data as Array<UserLinkInterface>;
      this.links = portalLinks;
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

  gonerLink: UserLinkInterface 
  openConfimRemoveUserLink(link: Object) {
    this.gonerLink = link as UserLinkInterface;
    this.removeUserLinkModal.updateModal(
      'Remove Link "' + this.gonerLink.name + '"' , 'Confirm deletion of link to ' + this.gonerLink.url 
      + '. This action cannot be undone.', 'Delete', 'Cancel');
    this.removeUserLinkModal.openModal();
  }
  removeUserLink() {
    this.portalSrv.removeUserLink(this.gonerLink).subscribe(data => {
      this.user_links = data as Array<UserLinkInterface>;
    });
  }
}
