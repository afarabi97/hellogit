import { NavLinkInterface } from './nav-link.interface';

/**
 * Interface defines the nav group
 *
 * @export
 * @interface NavGroupInterface
 */
export interface NavGroupInterface {
  id: string;
  label?: string;
  system: string[];
  children: NavLinkInterface[];
}
