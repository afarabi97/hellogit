/**
 * Interface defines the cookie service
 *
 * @export
 * @interface CookieServiceInterface
 */
export interface CookieServiceInterface {
  set(key: string, value: string): void;
  get(key: string): string;
}
