import { CatalogModule } from './catalog.module';

describe('CatalogModule', () => {
  let catalog_module: CatalogModule;

  beforeEach(() => {
    catalog_module = new CatalogModule();
  });

  it('should create an instance of CatalogModule', () => {
    expect(catalog_module).toBeTruthy();
  });
});
