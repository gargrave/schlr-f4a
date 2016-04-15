/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  import UserData = auth.UserData;

  export class AuthSvc {

    static $inject = [
      '$http', '$q', 'AuthCookiesSvc',
      'AuthCacheSvc', 'AuthUpdaterSvc', 'UrlsSvc'];

    // the data for hte currently logged-in user (if any)
    user: UserData;

    constructor(private $http: ng.IHttpService,
                private $q: ng.IQService,
                private cookies: AuthCookiesSvc,
                private cache: AuthCacheSvc,
                private authUpdater: AuthUpdaterSvc,
                private urls: app.common.UrlsSvc) {
      this.user = new UserData();
      this.readStoredTokenData();
      this.readStoredUserData();
    }

    /*=============================================
     = authentication methods
     =============================================*/
    /**
     * Attempts to authenticate the user with the provided email/password comination.
     *
     * @param email {string} The user's email address
     * @param password {string} The user's password
     * @returns {IPromise}
     */
    login(email: string, password: string): any {
      let deferred = this.$q.defer();
      const data = {
        email: email,
        password: password
      };

      this.authUpdater.broadcastLoginStart();
      this.$http.post(this.urls.loginUrl, data)
        .then((res) => {
          // set data in cookies/cache
          this.clearLocalUserData();
          // store the user's basic information
          let resUserData: UserData = <UserData>res.data;
          this.user.set(resUserData.id,
            resUserData.email,
            resUserData.displayName);
          this.setLocalUserData(res.headers('x-stamplay-jwt'));
          deferred.resolve(res);
        }, (err) => {
          deferred.reject(err);
        })
        .finally(() => {
          this.authUpdater.broadcastLoginEnd();
        });
      return deferred.promise;
    }

    /**
     * Attempts to log the current user out.
     *
     * @returns {IPromise}
     */
    logout(): ng.IPromise<any> {
      let deferred = this.$q.defer();

      this.authUpdater.broadcastLogoutStart();
      this.$http.get(this.urls.logoutUrl, this.getRequestHeaders())
        .then((res) => {
          deferred.resolve(res);
        }, (err) => {
          deferred.reject(err);
        })
        .finally(() => {
          if (this.isLoggedIn()) {
            this.authUpdater.broadcastLogoutEnd();
          }
          this.clearLocalUserData();
        });
      return deferred.promise;
    }

    /**
     * @returns {boolean} Whether the current user is authenticated
     */
    isLoggedIn(): boolean {
      return this.cookies.getTokenFromCookie() !== undefined;
    }

    /**
     * @returns {string} The authentication token for the currently logged-in user.
     */
    getToken(): string {
      return this.cookies.getTokenFromCookie() || this.cache.getTokenFromCache();
    }

    /**
     * @returns {string} The id string for the currently logged in user.
     */
    getUserId(): string {
      return this.user.id;
    }

    /**
     * Returns the headers necessary for any Stamply requests that require authentication.
     * @returns {IRequestShortcutConfig}
     */
    getRequestHeaders(): ng.IRequestShortcutConfig {
      return {
        headers: {'x-stamplay-jwt': this.getToken()}
      };
    }

    /**
     * Attempts to read and parse the authentication token. If the user is logged in from
     * a previous session, we can use this to restore user data. If there is no token, or
     * there is an expired token, any existing data will be cleared.
     */
    private readStoredTokenData(): void {
      const tokenCookie: string = this.cookies.getTokenFromCookie();
      const tokenCache: string = this.cache.getTokenFromCache();

      if (tokenCookie) {
        // is the cookie token value valid?
        // if so, copy the value to the cache
        // if not, clear the cookie
        const valid = this.tokenIsValid(this.getTokenAsJSON(tokenCookie));
        if (valid) {
          this.cache.setTokenAsCache(tokenCookie);
        } else {
          this.cookies.clearTokenCookie();
        }
      } else if (tokenCache) {
        // is the cache token value valid?
        // if so, copy the value to the cookie
        // if not, clear the cache
        const valid = this.tokenIsValid(this.getTokenAsJSON(tokenCache));
        if (valid) {
          this.cookies.setTokenAsCookie(tokenCache);
        } else {
          this.cache.clearTokenCache();
        }
      }
    }

    /**
     * Attempts to read user data stored in the cache. If none is found but the user
     * does have a valid token, we will query the user data server to refresh our local data.
     */
    private readStoredUserData(): void {
      const userCache: UserData = this.cache.getUserDataFromCache();

      if (userCache) {
        this.user.set(
          userCache.id,
          userCache.email,
          userCache.displayName);
      } else {
        const token: string =
          this.cookies.getTokenFromCookie() ||
          this.cache.getTokenFromCache();
        if (token) {
          const tokenJSON: any = this.getTokenAsJSON(token);
          const url: string = this.urls.apiBaseUrl + '/api/user/v1/users/' + tokenJSON.user;

          this.$http.get(url, this.getRequestHeaders())
            .then((res) => {
              let resUserData: UserData = <UserData>res.data;
              this.user.set(
                resUserData.id,
                resUserData.email,
                resUserData.displayName);
              this.setLocalUserData(token);
            });
        } else {
          this.logout();
        }
      }
    }

    /*=============================================
     = local storage methods
     =============================================*/
    private getTokenAsJSON(token: string): string {
      let tokenDecoded = atob(token.split('.')[1]); // reverse base64 encoding on the token
      return JSON.parse(tokenDecoded); // parse decoded string to JSON
    }

    private tokenIsValid(tokenJSON: any): boolean {
      let start = tokenJSON.iat; // issued-at date for token, in UAT seconds
      let end = tokenJSON.exp; // expiration date for token, in UAT seconds
      console.log('Expiration:');
      console.log(new Date(end * 1000));
      let now = Math.floor(Date.now() / 1000); // now, in UAT seconds
      return start < now < end; // has the existing token expired?
    }

    /**
     * Stores the auth token locally in a cookie and a cache, via local storage.
     * @param token {string} The auth token returned from the authentication API
     */
    private setLocalUserData(token: string): void {
      this.cookies.setTokenAsCookie(token);
      this.cache.setTokenAsCache(token);
      this.cache.setUserCache(this.user);
    }

    /**
     * Removes any locally-stored user authentication data.
     */
    private clearLocalUserData(): void {
      this.user.reset();
      this.cookies.clearTokenCookie();
      this.cache.clearTokenCache();
      this.cache.clearUserCache();
    }
  }

  angular.module('auth').service('AuthSvc', AuthSvc);
}
