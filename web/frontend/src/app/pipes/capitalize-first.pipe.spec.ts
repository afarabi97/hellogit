import { CapitalizeFirstPipe } from './capitalize-first.pipe';

describe('CapitalizeFirstPipe', () => {
  // This pipe is a pure, stateless function so no need for BeforeEach
  const pipe = new CapitalizeFirstPipe();

  describe('transform', () => {
    it(`transforms takes in 'abc' returns 'Abc'`, () => {
      const value: string = pipe.transform('abc');

      expect(value).toBe('Abc');
    });

    it(`transforms takes in 'abc def' returns 'Abc def'`, () => {
      const value: string = pipe.transform('abc def');

      expect(value).toBe('Abc def');
    });

    it(`transforms takes in 'ABc def' returns 'ABc def'`, () => {
      const value: string = pipe.transform('ABc def');

      expect(value).toBe('ABc def');
    });

    it(`transforms takes in 'null' returns 'Not assigned'`, () => {
      const value: string = pipe.transform(null);

      expect(value).toBe('Not assigned');
    });

    it(`transforms takes in 'undefined' returns 'Not assigned'`, () => {
      const value: string = pipe.transform(undefined);

      expect(value).toBe('Not assigned');
    });
  });
});
