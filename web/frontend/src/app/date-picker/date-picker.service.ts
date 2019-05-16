import {Injectable} from "@angular/core";
import {NgbDate} from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: 'root'
})
export class DatePickerService {
  public date: NgbDate;

  public setDate(timezone: string='UTC') {
    const date = new Date();    
    const year = date.toLocaleString('en-US', {year: 'numeric', timeZone: timezone })
    const month = date.toLocaleString('en-US', {month: '2-digit', timeZone: timezone })
    const day = date.toLocaleString('en-US', {day: '2-digit', timeZone: timezone })
    this.date = new NgbDate(parseInt(year), parseInt(month), parseInt(day));
  }
}
