import { MatSnackBar, MatSnackBarConfig, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

@Injectable()
export class SnackbarWrapper {
    constructor(private _snackBar: MatSnackBar) { }

    showSnackBar(message: string, timeInMs?: number, actionLabel?: string, callback?: (value: MatSnackBarDismiss) => void) {
        const config = new MatSnackBarConfig();
        if (timeInMs !== -1) {
            config.duration = timeInMs;
        }
        const toastRef = this._snackBar.open(message, actionLabel, config);

        toastRef.afterDismissed().subscribe(callback);
    }
}
