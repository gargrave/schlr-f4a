/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  export class AuthCookiesSvc {

    static $inject = ['$cookies'];

    // the key to use for cookies
    private tokenKey: string = 'auth-token';

    constructor(private $cookies: ng.cookies.ICookiesService) {
    }

    setTokenAsCookie(token: string): void {
      this.$cookies.put(this.tokenKey, token);
    }

    getTokenFromCookie(): string {
      return this.$cookies.get(this.tokenKey);
    }

    clearTokenCookie(): void {
      this.$cookies.remove(this.tokenKey);
    }
  }

  angular.module('auth').service('AuthCookiesSvc', AuthCookiesSvc);
}
