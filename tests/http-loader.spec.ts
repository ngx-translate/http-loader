import {Injector} from "@angular/core";
import {getTestBed, TestBed} from "@angular/core/testing";
import {
    BaseRequestOptions,
    ConnectionBackend,
    Http,
    HttpModule,
    RequestOptions,
    Response,
    ResponseOptions, XHRBackend
} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {TranslateHttpLoader} from "../index";

const mockBackendResponse = (connection: MockConnection, response: string) => {
    connection.mockRespond(new Response(new ResponseOptions({body: response})));
};

describe('TranslateLoader', () => {
    let injector: Injector;
    let translate: TranslateService;
    let backend: any;
    let connection: MockConnection; // this will be set when a new connection is emitted from the backend.

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: (http: Http) => new TranslateHttpLoader(http),
                        deps: [Http]
                    }
                })
            ],
            providers: [
                {provide: XHRBackend, useClass: MockBackend},
                {provide: ConnectionBackend, useClass: MockBackend},
                {provide: RequestOptions, useClass: BaseRequestOptions}
            ]
        });
        injector = getTestBed();
        translate = injector.get(TranslateService);
        backend = injector.get(XHRBackend);
        // sets the connection when someone tries to access the backend with an xhr request
        backend.connections.subscribe((c: MockConnection) => connection = c);
    });

    afterEach(() => {
        injector = undefined;
        translate = undefined;
        backend = undefined;
        connection = undefined;
    });

    it('should be able to provide TranslateHttpLoader', () => {
        expect(TranslateHttpLoader).toBeDefined();
        expect(translate.currentLoader).toBeDefined();
        expect(translate.currentLoader instanceof TranslateHttpLoader).toBeTruthy();
    });

    it('should be able to get translations', () => {
        translate.use('en');

        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe((res: string) => {
            expect(res).toEqual('This is a test');
        });

        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test", "TEST2": "This is another test"}');

        // this will request the translation from downloaded translations without making a request to the backend
        translate.get('TEST2').subscribe((res: string) => {
            expect(res).toEqual('This is another test');
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

            mockBackendResponse(connection, '{"TEST": "This is a test 2"}');
        });

        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });

    it('should be able to reset a lang', (done: Function) => {
        translate.use('en');
        spyOn(connection, 'mockRespond').and.callThrough();

        // this will request the translation from the backend because we use a static files loader for TranslateService
        translate.get('TEST').subscribe((res: string) => {
            expect(res).toEqual('This is a test');
            expect(connection.mockRespond).toHaveBeenCalledTimes(1);

            // reset the lang as if it was never initiated
            translate.resetLang('en');

            expect(translate.instant('TEST')).toEqual('TEST');

            // use set timeout because no request is really made and we need to trigger zone to resolve the observable
            setTimeout(() => {
                translate.get('TEST').subscribe((res2: string) => {
                    expect(res2).toEqual('TEST'); // because the loader is "pristine" as if it was never called
                    expect(connection.mockRespond).toHaveBeenCalledTimes(1);
                    done();
                });
            }, 10);
        });

        // mock response after the xhr request, otherwise it will be undefined
        mockBackendResponse(connection, '{"TEST": "This is a test"}');
    });
});
