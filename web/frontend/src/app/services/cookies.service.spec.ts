import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CookieServiceInterface } from '../interfaces';
import { CookieService } from './cookies.service';

describe('CookieService', () => {
  let service: CookieService;

  // Setup spy references
  let spySet: jasmine.Spy<any>;
  let spyGet: jasmine.Spy<any>;

  // Test Data
  const key = 'test';
  const keyValue = 'cookie';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        CookieService
      ]
    });

    service = TestBed.inject(CookieService);

    // Add method spies
    spySet = spyOn(service, 'set').and.callThrough();
    spyGet = spyOn(service, 'get').and.callThrough();
  });

  const reset = () => {

    spySet.calls.reset();
    spyGet.calls.reset();
  };

  it('should create CookieService', () => {
    expect(service).toBeTruthy();
  });

  describe('CookieService methods', () => {
    describe('set()', () => {
      it('should call set()', () => {
        reset();

        service.set(key, keyValue);

        expect(service.set).toHaveBeenCalled();
      });
    });

    describe('get()', () => {
      it('should call get()', () => {
        reset();

        service.get(key);

        expect(service.get).toHaveBeenCalled();
      });

      it('should call get() and set cookie', () => {
        reset();

        service.set(key, keyValue);
        const value: string = service.get(key);

        expect(value).toEqual(keyValue);
      });
    });
  });
});

@Injectable()
export class CookieServiceSpy implements CookieServiceInterface {

  set = jasmine.createSpy('set').and.callFake(
    (key: string, value: string): void => this.callFakeSet(key, value)
  );

  get = jasmine.createSpy('get').and.callFake(
    (key: string): string => this.callFakeGet(key)
  );

  private fakeDocumentCookies: Object = new Object();

  callFakeSet(key: string, value: string): void {
    this.fakeDocumentCookies[key] = value;
  }

  callFakeGet(key: string): string {
    return this.fakeDocumentCookies[key];
  }
}
