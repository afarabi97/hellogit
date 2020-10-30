import {DateTimeModule } from './date-time.module';

describe('DateTimeModule', () => {
  let dateTimeModule: DateTimeModule;

  beforeEach(() => {
    dateTimeModule = new DateTimeModule();
  });

  it('should create an instance of DateTimeModule', () => {
    expect(dateTimeModule).toBeTruthy();
  });
});
