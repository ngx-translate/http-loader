import {HttpClient} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable} from 'rxjs';

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: string = "/assets/i18n/", public suffix: string = ".json") {}

  /**
   * Gets the translations from the server
   */
  public getTranslation(lang: string): Observable<Object> {
  	if (this.loadedTranslations != null && this.loadedTranslations[lang] != null) {
  		return Observable.of(this.loadedTranslations[lang]);
  	}
  	return Observable.fromPromise(this.preLoad(lang));
  }

  /**
   * Gets the translations from the server as Promise
   * @param lang
   * @returns Promise<any>
   */
  public preLoad(lang: string): Promise<any> {
  	return this.http.get(`${this.prefix}${lang}${this.suffix}`)
  		.toPromise()
  		.then(result => {
  			this.loadedTranslations[lang] = result;
  			return result;
  		})
  		.catch(() => null); 
  }
}
