import { TemplateRef } from '@angular/core';

/**
 * Interface defines the dialog data
 *
 * @export
 * @interface DialogDataInterface
 * @template T
 */
export interface DialogDataInterface<T> {
  title?: string;
  template: TemplateRef<any>;
  context?: T;
}
