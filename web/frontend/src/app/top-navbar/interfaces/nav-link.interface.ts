/**
 * Interface defines the nav link
 *
 * @export
 * @interface NavLinkInterface
 */
export interface NavLinkInterface {
  label: string;
  url: string;
  icon: string;
  isExternalLink: boolean;
  section: string;
  system: Array<string>;
  privs: boolean;
  target?: string;
  kitStatus: boolean;
}
