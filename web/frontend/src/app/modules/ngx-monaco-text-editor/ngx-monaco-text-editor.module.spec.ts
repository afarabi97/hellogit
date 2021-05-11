import { NGXMonacoTextEditorModule } from './ngx-monaco-text-editor.module';

describe('NGXMonacoTextEditorModule', () => {
  let ngx_monaco_text_editor_module: NGXMonacoTextEditorModule;

  beforeEach(() => {
    ngx_monaco_text_editor_module = new NGXMonacoTextEditorModule();
  });

  it('should create an instance of NGXMonacoTextEditorModule', () => {
    expect(ngx_monaco_text_editor_module).toBeTruthy();
  });
});
