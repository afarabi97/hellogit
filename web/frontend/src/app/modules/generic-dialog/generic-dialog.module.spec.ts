import { GenericDialogModule } from './generic-dialog.module';

describe('GenericDialogModule', () => {
  let generic_dialog_module: GenericDialogModule;

  beforeEach(() => {
    generic_dialog_module = new GenericDialogModule();
  });

  it('should create an instance of GenericDialogModule', () => {
    expect(generic_dialog_module).toBeTruthy();
  });
});
