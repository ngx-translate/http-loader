import {HttpClient} from "@angular/common/http";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {fakeAsync, TestBed} from "@angular/core/testing";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {TranslateHttpMultiLoader, TranslationResource} from "../src/public_api";

// AoT requires an exported function for factories
export function translateLoaderFactory(http: HttpClient) {
  return new TranslateHttpMultiLoader( http, [
    { prefix: '/assets/i18n/home', suffix: '.json' },
    { prefix: '/assets/i18n/product', suffix: '.json' }
  ]);
}

describe('TranslateLoader', () => {
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: translateLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [TranslateService]
    });
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    translate = undefined;
    http = undefined;
  });

  it('should be able to provide TranslateHttpMultiLoader', () => {
    expect(TranslateHttpMultiLoader).toBeDefined();
    expect(translate.currentLoader).toBeDefined();
    expect(translate.currentLoader instanceof TranslateHttpMultiLoader).toBeTruthy();
  });

  it('should be able to get translations', () => {
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a home page test');
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/home/en.json').flush({
      "TEST": "This is a home page test",
      "TEST2": "This is another test"
    });

    http.expectOne('/assets/i18n/product/en.json').flush({
      "TEST3": "This is a product page test",
      "TEST4": "This is another test"
    });

    // this will request the translation from downloaded translations without making a request to the backend
    translate.get('TEST3').subscribe((res: string) => {
      expect(res).toEqual('This is a product page test');
    });
  });

  it('should be able to reload a lang', () => {
    translate.use('en');

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');

      // reset the lang as if it was never initiated
      translate.reloadLang('en').subscribe((res2: string) => {
        expect(translate.instant('TEST')).toEqual('This is a test 2');
      });

      http.expectOne('/assets/i18n/home/en.json').flush({"TEST": "This is a test 2"});
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/home/en.json').flush({"TEST": "This is a test"});
  });

  it('should be able to reset a lang', fakeAsync(() => {
    translate.use('en');
    spyOn(http, 'expectOne').and.callThrough();

    // this will request the translation from the backend because we use a static files loader for TranslateService
    translate.get('TEST').subscribe((res: string) => {
      expect(res).toEqual('This is a test');
      expect(http.expectOne).toHaveBeenCalledTimes(1);

      // reset the lang as if it was never initiated
      translate.resetLang('en');

      expect(translate.instant('TEST')).toEqual('TEST');

      // use set timeout because no request is really made and we need to trigger zone to resolve the observable
      setTimeout(() => {
        translate.get('TEST').subscribe((res2: string) => {
          expect(res2).toEqual('TEST'); // because the loader is "pristine" as if it was never called
          expect(http.expectOne).toHaveBeenCalledTimes(1);
        });
      }, 10);
    });

    // mock response after the xhr request, otherwise it will be undefined
    http.expectOne('/assets/i18n/home/en.json').flush({"TEST": "This is a test"});
  }));
});
