import { SelectOptionInterface } from '../interfaces/select-options.interface';

// Languages supported by text editor
export const EDITOR_LANGAUAGES: string[] = [
  'bat',
  'c',
  'coffeescript',
  'cpp',
  'csharp',
  'csp',
  'css',
  'dockerfile',
  'fsharp',
  'go',
  'handlebars',
  'html',
  'ini',
  'java',
  'javascript',
  'json',
  'less',
  'lua',
  'markdown',
  'msdax',
  'mysql',
  'objective-c',
  'pgsql',
  'php',
  'plaintext',
  'postiats',
  'powershell',
  'pug',
  'python',
  'r',
  'razor',
  'redis',
  'redshift',
  'ruby',
  'rust',
  'sb',
  'scss',
  'sol',
  'sql',
  'st',
  'swift',
  'typescript',
  'vb',
  'xml',
  'yaml'
];
// Themes supported by text editor
export const EDITOR_THEMES: SelectOptionInterface[] = [
  {
    value: 'vs',
    display_name: 'Light'
  },
  {
    value: 'vs-dark',
    display_name: 'Dark'
  }
];
// WordWrap types supported by text editor
export const WORDWRAP: SelectOptionInterface[] = [
  {
    value: 'off',
    display_name: 'OFF'
  },
  {
    value: 'on',
    display_name: 'ON'
  },
  {
    value: 'wordWrapColumn',
    display_name: 'Word Wrap Column'
  },
  {
    value: 'bounded',
    display_name: 'Bounded'
  }
];
// Tooltip messages
export const SAVE_DEFAULT_TOOLTIP: string = 'Save and close text editor window';
export const CLOSE_DEFAULT_TOOLTIP: string = 'Close text editor window without saving';
