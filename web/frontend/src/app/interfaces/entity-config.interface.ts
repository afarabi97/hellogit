/**
 * Interface defines entity config
 *
 * @export
 * @interface EntityConfig
 */
export interface EntityConfig {
  /**
   * {string} Entity name part of the url. Trailing slash is required
   */
  entityPart: string;
  type?: string;
}
