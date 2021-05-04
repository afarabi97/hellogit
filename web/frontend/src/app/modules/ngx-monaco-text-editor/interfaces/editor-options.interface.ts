import { MinimapInterface } from './minimap.interface';

/**
 * Interface defines the editor options
 *
 * @export
 * @interface EditorOptionsInterface
 */
export interface EditorOptionsInterface {
  theme: string;
  language: string;
  readOnly: boolean;
  renderSideBySide?: boolean;
  minimap: MinimapInterface;
  wordWrap: string;
  fontFamily: string;
  scrollBeyondLastLine: boolean;
  automaticLayout: boolean;
  links: boolean;
}
