import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable, of, forkJoin} from 'rxjs';
import { catchError } from 'rxjs/operators';

interface TranslateFilesList {
  prefix: string ; suffix: string;
}

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: string = "/assets/i18n/", public suffix: string = ".json") {}

  /**
   * Gets the translations from the server
   */
  public getTranslation(lang: string): Observable<Object> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`);
  }
}

export class MultipleTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, public paths:TranslateFilesList[]) {}

  /**
   * Gets the multiple translations from the server
   */
  public getTranslation(lang: string): Observable<Object> {

    return   new Observable(obs=>forkJoin(this.paths.map( item => this.http.get('' + item.prefix + lang +  item.suffix).pipe(catchError(res => {
      console.error("[Error] Something went wrong with --> ", res.url);
      return of({});
    })) ) ).subscribe( res=> { obs.next( Object.assign({}, ...res))} ));
  }
}
