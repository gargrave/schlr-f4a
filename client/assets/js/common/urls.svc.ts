/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export class UrlsSvc {

    static $inject = ['$location', 'URLS'];

    // whether we are operating in a dev or live environment
    isDev: boolean;
    // base URL for the API; will differ based on environment
    apiBaseUrl: string;
    // base URL for CRUD operations
    apiCrudBaseUrl: string;
    // url for sending login requests
    loginUrl: string;
    // url for sending logout requests
    logoutUrl: string;

    constructor(private $location,
                private URLS) {
      this.isDev = $location.absUrl().indexOf('localhost:8100') > -1;
      this.apiBaseUrl = this.isDev ? URLS.DEV : URLS.PROD;
      this.apiCrudBaseUrl = this.apiBaseUrl + '/api/cobject/v1';
      this.loginUrl = this.apiBaseUrl + '/auth/v1/local/login';
      this.logoutUrl = this.apiBaseUrl + '/auth/v1/logout?next=';
    }
  }

  angular.module('common').service('UrlsSvc', UrlsSvc);
}
