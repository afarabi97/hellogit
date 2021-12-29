import { Injectable } from "@angular/core";
import { Subscription, interval } from "rxjs";

/**
 * Service used for baseline testing purposes
 * Will not be packaged with final build
 *
 * @export
 * @class BaselineIntervalService
 */
@Injectable({
  providedIn: "root"
})
export class BaselineIntervalService {
  readonly dashes_: string = '------------------------------------------------';
  private interval_name_: string;
  private interval_active_: boolean;
  private interval_subscription: Subscription;

  /**
   * Creates an instance of BaselineIntervalService.
   *
   * @memberof BaselineIntervalService
   */
  constructor() {
    this.interval_active_ = false;
  }

  /**
   * Used for returning the interval name
   *
   * @returns {string}
   * @memberof BaselineIntervalService
   */
  get_interval_name(): string {
    return this.interval_name_;
  }

  /**
   * Used for for starting the interval for baseline testing
   *
   * @param {string} interval_name
   * @memberof BaselineIntervalService
   */
  start_interval(interval_name: string): void {
    this.interval_active_ = true;
    this.interval_name_ = interval_name;
    const message: string = `Starting baseline test for ${interval_name}`;
    console.log(this.dashes_);
    console.log(message);
    this.interval_subscription = interval(1000)
                                   .subscribe(
                                     (event: number) => {
                                       if (!this.interval_active_) {
                                         const time: string = `${this.transform_mm_ss_(event)}`;
                                         const end_interval_message: string = `${this.interval_name_}: ${time}`;
                                         console.log(end_interval_message);
                                         console.log(this.dashes_);
                                         this.interval_subscription.unsubscribe();
                                         this. interval_name_ = '';
                                       }
                                     });
  }

  /**
   * Used for setting stting the interval as active = false
   * the interval will do one last interval and print data
   * to console before setting unsubscribing
   *
   * @memberof BaselineIntervalService
   */
  stop_interval(): void {
    this.interval_active_ = false;
  }

  /**
   * Used for transforming interval seconds to human readable mm:ss format
   *
   * @private
   * @param {number} value
   * @returns {string}
   * @memberof DropTimerService
   */
  private transform_mm_ss_(value: number): string {
    const minutes: number = Math.floor(value / 60);

    return `${minutes.toString().padStart(2, '0')}:${(value - minutes * 60).toString().padStart(2, '0')}`;
  }
}
