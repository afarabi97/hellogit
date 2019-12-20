import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ArchiveService } from 'src/app/services/archive.service';
@Component({
  selector: 'app-kickstart-form-restore',
  templateUrl: './archive-restore-dialog.component.html',
  styleUrls: ['./archive-restore-dialog.component.scss']
})
export class ArchiveRestoreDialogComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<any>(false, []);
  showSelectedRow: boolean;

  @ViewChild(MatPaginator, {static: false})
  paginator: MatPaginator;

  constructor(public dialogRef: MatDialogRef<ArchiveRestoreDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private archiveService: ArchiveService) { }

  ngOnInit() {
    this.dataSource.data = this.data.archives;
    this.displayedColumns = this.data.display_columns;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  viewSelectedItem(row) {
    if (this.selection.selected.includes(row)) {
      return;
    } else {
      if (this.selection.selected.length > 0) {
        this.selection.deselect(this.selection.selected[0]);
      }
      this.selection.select(row)
    }
  }

  deleteArchive(row) {
    this.archiveService.deleteArchive(this.data.config_id, row._id).subscribe(data => {
      this.dataSource.data = this.dataSource.data.filter(dr => dr._id !== row._id);
    });
  }
}
