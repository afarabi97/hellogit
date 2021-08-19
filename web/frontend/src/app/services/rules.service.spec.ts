import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable, of as observableOf, Subject, throwError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  MockArrayRuleSetClass,
  MockErrorMessageClass,
  MockRuleClass,
  MockRuleForDeleteClass,
  MockRuleForToggleClass,
  MockRuleSetClass,
  MockRuleSyncClass,
  MockSuccessMessageClass
} from '../../../static-data/class-objects-v3_6';
import {
  MockRuleForToggleInterface,
  MockRuleInterface,
  MockRuleSetInterface,
  MockRuleSyncInterface,
  MockSuccessMessageInterface
} from '../../../static-data/interface-objects-v3_6';
import { environment } from '../../environments/environment';
import {
  ErrorMessageClass,
  ObjectUtilitiesClass,
  RuleClass,
  RuleSetClass,
  RuleSyncClass,
  SuccessMessageClass
} from '../classes';
import { RuleInterface, RulePCAPTestInterface, RuleSetInterface, RulesServiceInterface } from '../interfaces';
import { InjectorModule } from '../modules/utilily-modules/injector.module';
import { ApiService } from './abstract/api.service';
import { RulesService } from './rules.service';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_mock_blob = (file: MockFile): Blob => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob;
};

const create_file_from_mock_file = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob as File;
};

describe('RulesService', () => {
  let service: RulesService;
  let httpMock: HttpTestingController;

  // Setup spy references
  let spyGetRuleSets: jasmine.Spy<any>;
  let spyCreateRuleSet: jasmine.Spy<any>;
  let spyUpdateRuleSet: jasmine.Spy<any>;
  let spyDeleteRuleSet: jasmine.Spy<any>;
  let spySyncRuleSets: jasmine.Spy<any>;
  let spyGetRules: jasmine.Spy<any>;
  let spyCreateRule: jasmine.Spy<any>;
  let spyUpdateRule: jasmine.Spy<any>;
  let spyDeleteRule: jasmine.Spy<any>;
  let spyGetUploadRuleFile: jasmine.Spy<any>;
  let spyGetRuleContent: jasmine.Spy<any>;
  let spyValidateRule: jasmine.Spy<any>;
  let spyTestRuleAgainstPCAP: jasmine.Spy<any>;
  let spyToggleRule: jasmine.Spy<any>;
  let spyMapRuleListOrRule: jasmine.Spy<any>;

  // Used to handle subscriptions
  const ngUnsubscribe$: Subject<void> = new Subject<void>();

  // Test Data Type
  const getType = 'GET';
  const postType = 'POST';
  const putType = 'PUT';
  const deleteType = 'DELETE';

  // Test Data
  const errorRequest = 'Servers are not working as expected. The request is probably valid but needs to be requested again later.';
  const errorMessageRequest = {
    error_message: 'Servers are not working as expected. The request is probably valid but needs to be requested again later.'
  };
  const mockErrorResponse = { status: 500, statusText: 'Internal Server Error' };
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const form_data = new FormData();
  form_data.append('upload_file', create_file_from_mock_file(mock_file), mock_file.name);
  form_data.append('ruleSetForm', JSON.stringify(MockRuleSetInterface as RuleSetInterface));
  const payload: RulePCAPTestInterface = {
    pcap_name: 'FakePCAPName',
    rule_content: MockRuleInterface.rule,
    ruleType: MockRuleSetInterface.appType
  };
  const mock_blob: Blob = create_mock_blob(mock_file);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        InjectorModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        RulesService,
        ApiService
      ]
    });

    service = TestBed.inject(RulesService);
    httpMock = TestBed.inject(HttpTestingController);

    // Add method spies
    spyGetRuleSets = spyOn(service, 'get_rule_sets').and.callThrough();
    spyCreateRuleSet = spyOn(service, 'create_rule_set').and.callThrough();
    spyUpdateRuleSet = spyOn(service, 'update_rule_set').and.callThrough();
    spyDeleteRuleSet = spyOn(service, 'delete_rule_set').and.callThrough();
    spySyncRuleSets = spyOn(service, 'sync_rule_sets').and.callThrough();
    spyGetRules = spyOn(service, 'get_rules').and.callThrough();
    spyCreateRule = spyOn(service, 'create_rule').and.callThrough();
    spyUpdateRule = spyOn(service, 'update_rule').and.callThrough();
    spyDeleteRule = spyOn(service, 'delete_rule').and.callThrough();
    spyGetUploadRuleFile = spyOn(service, 'upload_rule_file').and.callThrough();
    spyGetRuleContent = spyOn(service, 'get_rule_content').and.callThrough();
    spyValidateRule = spyOn(service, 'validate_rule').and.callThrough();
    spyTestRuleAgainstPCAP = spyOn(service, 'test_rule_against_pcap').and.callThrough();
    spyToggleRule = spyOn(service, 'toggle_rule').and.callThrough();
    spyMapRuleListOrRule = spyOn<any>(service, 'map_rule_list_or_rule_').and.callThrough();
  });

  afterAll(() => {
    ngUnsubscribe$.next();
    ngUnsubscribe$.complete();
  });

  const reset = () => {
    ngUnsubscribe$.next();

    spyGetRuleSets.calls.reset();
    spyCreateRuleSet.calls.reset();
    spyUpdateRuleSet.calls.reset();
    spyDeleteRuleSet.calls.reset();
    spySyncRuleSets.calls.reset();
    spyGetRules.calls.reset();
    spyCreateRule.calls.reset();
    spyUpdateRule.calls.reset();
    spyDeleteRule.calls.reset();
    spyGetUploadRuleFile.calls.reset();
    spyGetRuleContent.calls.reset();
    spyValidateRule.calls.reset();
    spyTestRuleAgainstPCAP.calls.reset();
    spyToggleRule.calls.reset();
    spyMapRuleListOrRule.calls.reset();
  };
  const after = () => {
    httpMock.verify();
  };

  it('should create RulesService', () => {
    expect(service).toBeTruthy();
  });

  describe('RulesService methods', () => {

    describe('REST get_rule_sets()', () => {
      it('should call get_rule_sets()', () => {
        reset();

        service.get_rule_sets()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleSetClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockRuleSetClass[key]);
              }
            });

            expect(service.get_rule_sets).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockRuleSetClass]);

        after();
      });

      it('should call get_rule_sets() and handle error', () => {
        reset();

        service.get_rule_sets()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSetClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_rule_sets).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST create_rule_set()', () => {
      it('should call create_rule_set() and return rule set', () => {
        reset();

        service.create_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleSetClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleSetClass[key]);
              }
            });

            expect(service.create_rule_set).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockRuleSetClass);

        after();
      });

      it('should call create_rule_set() and handle error message error', () => {
        reset();

        service.create_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSetClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.create_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call create_rule_set() and handle error', () => {
        reset();

        service.create_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSetClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.create_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST update_rule_set()', () => {
      it('should call update_rule_set() and return rule set', () => {
        reset();

        service.update_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleSetClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleSetClass[key]);
              }
            });

            expect(service.update_rule_set).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockRuleSetClass);

        after();
      });

      it('should call update_rule_set() and handle error message error', () => {
        reset();

        service.update_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSetClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.update_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call update_rule_set() and handle error', () => {
        reset();

        service.update_rule_set(MockRuleSetInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSetClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.update_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_rule_set()', () => {
      it('should call delete_rule_set() and return success message', () => {
        reset();

        service.delete_rule_set(MockRuleSetInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.delete_rule_set).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE_SETS}/${MockRuleSetInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call delete_rule_set() and handle error message error', () => {
        reset();

        service.delete_rule_set(MockRuleSetInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.delete_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE_SETS}/${MockRuleSetInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call delete_rule_set() and handle error', () => {
        reset();

        service.delete_rule_set(MockRuleSetInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: ErrorMessageClass | SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_rule_set).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE_SETS}/${MockRuleSetInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST sync_rule_sets()', () => {
      it('should call sync_rule_sets() and return rule sync', () => {
        reset();

        service.sync_rule_sets()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleSyncClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleSyncClass[key]);
              }
            });

            expect(service.sync_rule_sets).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS_SYNC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockRuleSyncInterface);

        after();
      });

      it('should call sync_rule_sets() and handle error', () => {
        reset();

        service.sync_rule_sets()
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleSyncClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.sync_rule_sets).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_SETS_SYNC;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_rules()', () => {
      it('should call get_rules()', () => {
        reset();

        service.get_rules(MockRuleSetInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass[]) => {
            expect(response.length).toEqual(1);

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.get_rules).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.RULES_SERVICE_RULES}/${MockRuleSetInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush([MockRuleClass]);

        after();
      });

      it('should call get_rules() and handle error', () => {
        reset();

        service.get_rules(MockRuleSetInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_rules).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULES}/${MockRuleSetInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST create_rule()', () => {
      it('should call create_rule() and return rule', () => {
        reset();

        service.create_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.create_rule).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockRuleClass);

        after();
      });

      it('should call create_rule() and handle error message error', () => {
        reset();

        service.create_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.create_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call create_rule() and handle error', () => {
        reset();

        service.create_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.create_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST update_rule()', () => {
      it('should call update_rule() and return rule', () => {
        reset();

        service.update_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.update_rule).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockRuleClass);

        after();
      });

      it('should call update_rule() and handle error message error', () => {
        reset();

        service.update_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.update_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call update_rule() and handle error', () => {
        reset();

        service.update_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.update_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST delete_rule()', () => {

      it('should call delete_rule() and return success message', () => {
        reset();

        service.delete_rule(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.delete_rule).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(deleteType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call delete_rule() and handle error message error', () => {
        reset();

        service.delete_rule(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.delete_rule).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call delete_rule() and handle error', () => {
        reset();

        service.delete_rule(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.delete_rule).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST upload_rule_file()', () => {
      it('should call upload_rule_file() and return rule', () => {
        reset();

        service.upload_rule_file(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass | RuleClass[]) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.upload_rule_file).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_UPLOAD_RULE_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockRuleClass);

        after();
      });

      it('should call upload_rule_file() and return rule[]', () => {
        reset();

        service.upload_rule_file(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass | RuleClass[]) => {
            if (response instanceof Array) {
              expect(response.length).toEqual(1);
            }

            const objectKeys: string[] = Object.keys(response[0]);
            objectKeys.forEach((key: string) => {
              if (!(response[0][key] instanceof Array)) {
                expect(response[0][key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.upload_rule_file).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_UPLOAD_RULE_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush([MockRuleClass]);

        after();
      });

      it('should call upload_rule_file() and handle error message error', () => {
        reset();

        service.upload_rule_file(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass | RuleClass[]) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.upload_rule_file).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_UPLOAD_RULE_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call upload_rule_file() and handle error', () => {
        reset();

        service.upload_rule_file(form_data)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass | RuleClass[]) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.upload_rule_file).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_UPLOAD_RULE_FILE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST get_rule_content()', () => {
      it('should call get_rule_content() and return rule', () => {
        reset();

        service.get_rule_content(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleClass[key]);
              }
            });

            expect(service.get_rule_content).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}/content`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(getType);

        xhrRequest.flush(MockRuleClass);

        after();
      });

      it('should call get_rule_content() and handle error message error', () => {
        reset();

        service.get_rule_content(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.get_rule_content).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}/content`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call get_rule_content() and handle error', () => {
        reset();

        service.get_rule_content(MockRuleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.get_rule_content).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleInterface._id}/content`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST validate_rule()', () => {
      it('should call validate_rule() and return success message', () => {
        reset();

        service.validate_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: SuccessMessageClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockSuccessMessageClass[key]);
              }
            });

            expect(service.validate_rule).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_RULE_VALIDATE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(MockSuccessMessageInterface);

        after();
      });

      it('should call validate_rule() and handle error message error', () => {
        reset();

        service.validate_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.validate_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_VALIDATE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call validate_rule() and handle error', () => {
        reset();

        service.validate_rule(MockRuleInterface)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: SuccessMessageClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.validate_rule).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_RULE_VALIDATE;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('REST test_rule_against_pcap()', () => {
      it('should call test_rule_against_pcap() and return success message', () => {
        reset();

        service.test_rule_against_pcap(payload)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: Blob) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(mock_blob[key]);
              }
            });

            expect(service.test_rule_against_pcap).toHaveBeenCalled();
          });

        const xhrURL: string = environment.RULES_SERVICE_TEST_RULE_AGAINST_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(postType);

        xhrRequest.flush(mock_blob);

        after();
      });

      it('should call test_rule_against_pcap() and handle blob error and return blob', () => {
        reset();

        const new_blob = new Blob([errorRequest], { type: 'application/json' });

        service.test_rule_against_pcap(payload)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: Blob) => {},
            (error: HttpErrorResponse) => {
              expect(error.error instanceof Blob).toBeTrue();
              expect(service.test_rule_against_pcap).toHaveBeenCalled();
            });

        const xhrURL: string = environment.RULES_SERVICE_TEST_RULE_AGAINST_PCAP;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(new_blob, mockErrorResponse);

        after();
      });
    });

    describe('REST toggle_rule()', () => {
      it('should call toggle_rule() and return rule', () => {
        reset();

        MockRuleForToggleClass.isEnabled = MockRuleForToggleInterface.isEnabled;

        service.toggle_rule(MockRuleForToggleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe((response: RuleClass) => {
            const objectKeys: string[] = Object.keys(response);
            objectKeys.forEach((key: string) => {
              if (!(response[key] instanceof Array)) {
                expect(response[key]).toEqual(MockRuleForToggleClass[key]);
              }
            });

            expect(service.toggle_rule).toHaveBeenCalled();
          });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleForToggleInterface._id}/toggle`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        expect(xhrRequest.request.method).toEqual(putType);

        xhrRequest.flush(MockRuleForToggleInterface);

        after();
      });

      it('should call toggle_rule() and handle error message error', () => {
        reset();

        MockRuleForToggleClass.isEnabled = MockRuleForToggleInterface.isEnabled;

        service.toggle_rule(MockRuleForToggleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error['error'] instanceof ErrorMessageClass) {
                const objectKeys: string[] = Object.keys(error['error']);
                objectKeys.forEach((key: string) => {
                  if (!(error['error'][key] instanceof Array)) {
                    expect(error['error'][key]).toEqual(errorMessageRequest[key]);
                  }
                });
                expect(error['error']).toContain(errorMessageRequest);
              }
              expect(service.toggle_rule).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleForToggleInterface._id}/toggle`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorMessageRequest, mockErrorResponse);

        after();
      });

      it('should call toggle_rule() and handle error', () => {
        reset();

        MockRuleForToggleClass.isEnabled = MockRuleForToggleInterface.isEnabled;

        service.toggle_rule(MockRuleForToggleInterface._id)
          .pipe(takeUntil(ngUnsubscribe$))
          .subscribe(
            (response: RuleClass) => {},
            (error: HttpErrorResponse) => {
              expect(error.error).toContain(errorRequest);
              expect(service.toggle_rule).toHaveBeenCalled();
            });

        const xhrURL: string = `${environment.RULES_SERVICE_RULE}/${MockRuleForToggleInterface._id}/toggle`;
        const xhrRequest: TestRequest = httpMock.expectOne(xhrURL);

        xhrRequest.flush(errorRequest, mockErrorResponse);

        after();
      });
    });

    describe('private map_rule_list_or_rule_()', () => {
      it('should call map_rule_list_or_rule_()', () => {
        reset();

        service['map_rule_list_or_rule_'](MockRuleInterface);

        expect(service['map_rule_list_or_rule_']).toHaveBeenCalled();

        after();
      });

      it('should call map_rule_list_or_rule_() and return rule[]', () => {
        reset();

        const return_value = service['map_rule_list_or_rule_']([MockRuleInterface]);

        if (return_value instanceof Array) {
          expect(return_value instanceof Array).toBeTrue();

          return_value.forEach((v: RuleClass) => expect(v instanceof RuleClass).toBeTrue());
        }

        after();
      });

      it('should call map_rule_list_or_rule_() and return rule', () => {
        reset();

        const return_value = service['map_rule_list_or_rule_'](MockRuleInterface);

        expect(return_value instanceof RuleClass).toBeTrue();

        after();
      });
    });
  });
});

@Injectable()
export class RulesServiceSpy implements RulesServiceInterface {

  get_edit_rule = jasmine.createSpy('get_edit_rule').and.callFake(
    (): RuleClass => this.call_fake_get_edit_rule()
  );

  set_edit_rule = jasmine.createSpy('set_edit_rule').and.callFake(
    (value: RuleClass): void => this.call_fake_set_edit_rule(value)
  );

  get_edit_rule_set = jasmine.createSpy('get_edit_rule_set').and.callFake(
    (): RuleSetClass => this.call_fake_get_edit_rule_set()
  );

  set_edit_rule_set = jasmine.createSpy('set_edit_rule_set').and.callFake(
    (value: RuleSetClass): void => this.call_fake_set_edit_rule_set(value)
  );

  get_is_user_adding = jasmine.createSpy('get_is_user_adding').and.callFake(
    (): Observable<boolean> => this.call_fake_get_is_user_adding()
  );

  set_is_user_adding = jasmine.createSpy('set_is_user_adding').and.callFake(
    (value: boolean): void => this.call_fake_set_is_user_adding(value)
  );

  get_is_user_editing = jasmine.createSpy('get_is_user_editing').and.callFake(
    (): Observable<boolean> => this.call_fake_get_is_user_editing()
  );

  set_is_user_editing = jasmine.createSpy('set_is_user_editing').and.callFake(
    (value: boolean): void => this.call_fake_set_is_user_editing(value)
  );

  get_rule_sets = jasmine.createSpy('get_rule_sets').and.callFake(
    (): Observable<RuleSetClass[]> => this.call_fake_get_rule_sets()
  );

  create_rule_set = jasmine.createSpy('create_rule_set').and.callFake(
    (rule_set: RuleSetInterface): Observable<RuleSetClass> => this.call_fake_create_rule_set(rule_set)
  );

  update_rule_set = jasmine.createSpy('update_rule_set').and.callFake(
    (rule_set: RuleSetInterface): Observable<RuleSetClass> => this.call_fake_update_rule_set(rule_set)
  );

  delete_rule_set = jasmine.createSpy('delete_rule_set').and.callFake(
    (rule_set_id: number): Observable<SuccessMessageClass> => this.call_fake_delete_rule_set(rule_set_id)
  );

  sync_rule_sets = jasmine.createSpy('sync_rule_sets').and.callFake(
    (): Observable<RuleSyncClass> => this.call_fake_sync_rule_sets()
  );

  get_rules = jasmine.createSpy('get_rules').and.callFake(
    (rule_set_id: number): Observable<RuleClass[]> => this.call_fake_get_rules(rule_set_id)
  );

  create_rule = jasmine.createSpy('create_rule').and.callFake(
    (rule: RuleInterface): Observable<RuleClass> => this.call_fake_create_rule(rule)
  );

  update_rule = jasmine.createSpy('update_rule').and.callFake(
    (rule: RuleInterface): Observable<RuleClass> => this.call_fake_update_rule(rule)
  );

  delete_rule = jasmine.createSpy('delete_rule').and.callFake(
    (rule_id: number): Observable<SuccessMessageClass> => this.call_fake_delete_rule(rule_id)
  );

  upload_rule_file = jasmine.createSpy('upload_rule_file').and.callFake(
    (form_data: FormData): Observable<RuleClass | RuleClass[]> => this.call_fake_upload_rule_file(form_data)
  );

  get_rule_content = jasmine.createSpy('get_rule_content').and.callFake(
    (rule_id: number): Observable<RuleClass> => this.call_fake_get_rule_content(rule_id)
  );

  validate_rule = jasmine.createSpy('validate_rule').and.callFake(
    (rule: RuleInterface): Observable<SuccessMessageClass> => this.call_fake_validate_rule(rule)
  );

  test_rule_against_pcap = jasmine.createSpy('test_rule_against_pcap').and.callFake(
    (payload: RulePCAPTestInterface): Observable<Blob> => this.call_fake_test_rule_against_pcap(payload)
  );

  toggle_rule = jasmine.createSpy('toggle_rule').and.callFake(
    (rule_id: number): Observable<RuleClass> => this.call_fake_toggle_rule(rule_id)
  );

  private edit_rule_: RuleClass;
  private edit_rule_set_: RuleSetClass;
  private is_user_adding$_: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private is_user_editing$_: Subject<boolean> = new BehaviorSubject<boolean>(false);
  private rule_sets_: RuleSetClass[] = MockArrayRuleSetClass;
  private rules_: RuleClass[] = [MockRuleClass, MockRuleForToggleClass, MockRuleForDeleteClass];

  call_fake_get_edit_rule(): RuleClass {
    return this.edit_rule_;
  }

  call_fake_set_edit_rule(value: RuleClass): void {
    this.edit_rule_ = value;
  }

  call_fake_get_edit_rule_set(): RuleSetClass {
    return this.edit_rule_set_;
  }

  call_fake_set_edit_rule_set(value: RuleSetClass): void {
    this.edit_rule_set_ = value;
  }

  call_fake_get_is_user_adding(): Observable<boolean> {
    return this.is_user_adding$_.asObservable();
  }

  call_fake_set_is_user_adding(value: boolean): void {
    this.is_user_adding$_.next(value);
  }

  call_fake_get_is_user_editing(): Observable<boolean> {
    return this.is_user_editing$_.asObservable();
  }

  call_fake_set_is_user_editing(value: boolean): void {
    this.is_user_editing$_.next(value);
  }

  call_fake_get_rule_sets(): Observable<RuleSetClass[]> {
    return observableOf(this.rule_sets_);
  }

  call_fake_create_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass> {
    const rule_set_new: RuleSetClass = new RuleSetClass(rule_set);
    this.rule_sets_.push(rule_set_new);

    return ObjectUtilitiesClass.notUndefNull(rule_set_new) ? observableOf(rule_set_new) : throwError(MockErrorMessageClass);
  }

  call_fake_update_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass> {
    const rule_set_update: RuleSetClass = new RuleSetClass(rule_set);
    this.rule_sets_ = this.rule_sets_.map((rs: RuleSetClass) => rule_set._id === rs._id ? rule_set_update : rs);

    return this.check_for_rule_set_(rule_set_update) ? observableOf(rule_set_update) : throwError(MockErrorMessageClass);
  }

  call_fake_delete_rule_set(rule_set_id: number): Observable<SuccessMessageClass> {
    let rule_set: RuleSetClass;
    this.rule_sets_.filter((rs: RuleSetClass) => {
      if (rs._id !== rule_set_id) {
        return rs;
      } else {
        rule_set = rs;
      }
    });

    return ObjectUtilitiesClass.notUndefNull(rule_set) ? observableOf(MockSuccessMessageClass) : throwError(MockErrorMessageClass);
  }

  call_fake_sync_rule_sets(): Observable<RuleSyncClass> {
    return observableOf(MockRuleSyncClass);
  }

  call_fake_get_rules(rule_set_id: number): Observable<RuleClass[]> {
    const rules: RuleClass[] = this.rules_.filter((r: RuleClass) => r.rule_set_id === rule_set_id);

    return observableOf(rules);
  }

  call_fake_create_rule(rule: RuleInterface): Observable<RuleClass> {
    const rule_new: RuleClass = new RuleClass(rule);
    this.rules_.push(rule_new);

    return ObjectUtilitiesClass.notUndefNull(rule_new) ? observableOf(rule_new) : throwError(MockErrorMessageClass);
  }

  call_fake_update_rule(rule: RuleInterface): Observable<RuleClass> {
    const rule_update: RuleClass = new RuleClass(rule);
    this.rules_ = this.rules_.map((r: RuleClass) => rule._id === r._id ? rule_update : r);

    return this.check_for_rule_(rule_update) ? observableOf(rule_update) : throwError(MockErrorMessageClass);
  }

  call_fake_delete_rule(rule_id: number): Observable<SuccessMessageClass> {
    let rule: RuleClass;
    this.rules_.filter((r: RuleClass) => {
      if (r._id !== rule_id) {
        return r;
      } else {
        rule = r;
      }
    });

    return ObjectUtilitiesClass.notUndefNull(rule) ? observableOf(MockSuccessMessageClass) : throwError(MockErrorMessageClass);
  }

  call_fake_upload_rule_file(form_data: FormData): Observable<RuleClass | RuleClass[]> {
    return ObjectUtilitiesClass.notUndefNull(form_data) ? observableOf(MockRuleClass) : throwError(MockErrorMessageClass);
  }

  call_fake_get_rule_content(rule_id: number): Observable<RuleClass> {
    let rule: RuleClass;
    this.rules_.filter((r: RuleClass) => {
      if (r._id !== rule_id) {
        return r;
      } else {
        rule = new RuleClass(r as RuleInterface);
      }
    });

    return ObjectUtilitiesClass.notUndefNull(rule) ? observableOf(rule) : throwError(MockErrorMessageClass);
  }

  call_fake_validate_rule(rule: RuleInterface): Observable<SuccessMessageClass> {
    const new_rule: RuleClass = new RuleClass(rule);

    return new_rule instanceof RuleClass ? observableOf(MockSuccessMessageClass) : throwError(MockErrorMessageClass);
  }

  call_fake_test_rule_against_pcap(payload: RulePCAPTestInterface): Observable<Blob> {
    const mock_file: MockFile = {
      name: 'FakeFileName.zip',
      body: 'FakeFileBody',
      mimeType: 'application/zip'
    };

    return observableOf(create_mock_blob(mock_file));
  }

  call_fake_toggle_rule(rule_id: number): Observable<RuleClass> {
    let rule: RuleClass;
    this.rules_ = this.rules_.filter((r: RuleClass) => {
      if (r._id !== rule_id) {
        return r;
      } else {
        r.isEnabled = !r.isEnabled;
        rule = new RuleClass(r as RuleInterface);

        return r;
      }
    });

    return ObjectUtilitiesClass.notUndefNull(rule) ? observableOf(rule) : throwError(MockErrorMessageClass);
  }

  private check_for_rule_(rule: RuleClass): boolean {
    const search = (r: RuleClass) => r._id === rule._id;

    return this.rules_.findIndex(search) !== -1;
  }

  private check_for_rule_set_(rule_set: RuleSetClass): boolean {
    const search = (rs: RuleSetClass) => rs._id === rule_set._id;

    return this.rule_sets_.findIndex(search) !== -1;
  }
}
