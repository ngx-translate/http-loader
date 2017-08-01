import {HttpClient,HttpHeaders} from "@angular/common/http";
import {TranslateLoader} from "@ngx-translate/core";
import "rxjs/add/operator/map";

export class TranslateHttpLoader implements TranslateLoader {
    constructor(private http: HttpClient, private headers?: HttpHeaders, private prefix: string = "/assets/i18n/", private suffix: string = ".json") {}

    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    public getTranslation(lang: string): any {
        if (this.headers) {
            return this.http.get(`${this.prefix}${lang}${this.suffix}`, {
                headers: this.headers
            });
        } else {
            return this.http.get(`${this.prefix}${lang}${this.suffix}`);
        }
    }
}
