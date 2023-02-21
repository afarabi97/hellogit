import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../modules/global-components/components/confirm-dialog/confirm-dialog.component';

const DIALOG_WIDTH = '800px';

@Injectable({ providedIn: 'root',})
export class ConfirmActionPopup {

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  public displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000});
  }
  /**
   * Pop up a dialog to prompt user to decide if an action should be performed.
   * @param title             Title of the dialog window.
   * @param message           Text displayed in the dialog window.
   * @param confirmButtonText Text on the confirm button.
   * @param successText       Text displayed in a snack-bar if action is successsful.
   * @param failText          Text displayed if action fails.
   * @param actionFunc        Method to call if user clicks the confirm button.
   */
  public confirmAction(title: string,
    message: string,
    confirmButtonText: string,
    successText: string,
    failText: string,
    actionFunc: () => void) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: {
        "message": message,
        "title": title,
        "option1": "Cancel",
        "option2": confirmButtonText
      }
    });
    dialogRef.afterClosed().subscribe(
      response => {
        if (response === confirmButtonText) {
          actionFunc();
          this.displaySnackBar(successText);
        }
      },
      error => {
          this.displaySnackBar(`${failText}, received error: ${error}`);
      }
    );
  }
}
