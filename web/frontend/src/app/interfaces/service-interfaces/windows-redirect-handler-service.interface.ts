/**
 * Interface defines the Window Redirect Handler Service
 *
 * @export
 * @interface WindowsRedirectHandlerServiceInterface
 */
export interface WindowsRedirectHandlerServiceInterface {
  open_in_new_tab(url: string): void;
}
