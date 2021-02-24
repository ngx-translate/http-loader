import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable, of, forkJoin} from 'rxjs';
import {catchError, map} from "rxjs/operators";

export interface TranslationResource {
  prefix: string;
  suffix: string;
}

export class TranslateHttpMultiLoader implements TranslateLoader {
  constructor(private http: HttpClient, private resources: TranslationResource[]) {}

  /**
   * Gets the multiple translation files from the server
   */
  public getTranslation(lang: string): Observable<Object> {
    const requests = this.resources.map((resource) => {
      const path = `${resource.prefix}/${lang}${resource.suffix}`;
      return this.http.get(path).pipe(
        catchError((res) => {
          return of({});
        })
      );
    });
    return forkJoin(requests).pipe(map((response) => Object.assign({}, ...response)));
  }
}
