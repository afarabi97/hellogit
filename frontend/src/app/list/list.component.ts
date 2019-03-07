
/* Node Module Imports */
import { Component, Output, Input, EventEmitter } from '@angular/core';

declare var ms: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html'
  //styleUrls: ['./list.component.css']
})

export class ListComponent {
  @Input() isTracksList: Boolean = false;
  @Input() items: Array<Object>;
  @Input() displayKey: String;
  @Input() itemKey;
  @Output() onSelection = new EventEmitter();
  selectedItem;
  symbol;

  constructor() {}

  isItemSelected(item) {
    if (this.selectedItem) {
      return item[this.itemKey] === this.selectedItem[this.itemKey];
    }
    return false;
  }

  onSelectionAction(item) {
    if (this.selectedItem === item) {
      this.selectedItem = undefined;
      this.onSelection.emit({
        selected: undefined
      });
    } else {
      this.selectedItem = item;
      this.onSelection.emit({
        selected: item
      });
    }
  }

  clearSelection() {
    this.selectedItem = null;
  }

}
