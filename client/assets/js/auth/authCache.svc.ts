/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  import UserData = auth.UserData;

  const TWO_WEEKS: number = 2 * 60 * 60 * 24 * 7 * 1000;

  export class AuthCacheSvc {

    static $inject = ['CacheFactory'];

    // the key to use for cookie/cache storage
    tokenKey: string = 'auth-token';
    // key and object for user data cache
    tokenCache: any;
    userCache: any;

    constructor(private CacheFactory) {
    }

    /*=============================================
     = token cache methods
     =============================================*/
    initTokenCache(): void {
      if (!this.CacheFactory.get('token')) {
        this.tokenCache = this.CacheFactory('token', {
          storageMode: 'localStorage',
          maxAge: TWO_WEEKS,
          deleteOnExpire: 'aggressive'
        });
      }
    }

    setTokenAsCache(token: string): void {
      this.initTokenCache();
      this.tokenCache.put(this.tokenKey, {token: token});
    }

    getTokenFromCache(): string {
      this.initTokenCache();
      if (this.tokenCache && this.tokenCache.get(this.tokenKey)) {
        return this.tokenCache.get(this.tokenKey).token;
      }
      return undefined;
    }

    clearTokenCache(): void {
      if (this.tokenCache && this.tokenCache.get(this.tokenKey)) {
        this.tokenCache.remove(this.tokenKey);
      }
    }

    /*=============================================
     = user cache methods
     =============================================*/
    initUserCache(): void {
      if (!this.CacheFactory.get('user')) {
        this.userCache = this.CacheFactory('user', {
          storageMode: 'localStorage',
          maxAge: TWO_WEEKS,
          deleteOnExpire: 'aggressive'
        });
      }
    }

    setUserCache(user: UserData): void {
      this.initUserCache();
      this.userCache.put('user', {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    }

    getUserDataFromCache(): UserData {
      this.initUserCache();
      let data: UserData = undefined;
      if (this.userCache && this.userCache.get('user')) {
        let cacheData = this.userCache.get('user');
        data = new UserData(
          cacheData.id,
          cacheData.email,
          cacheData.displayName);
      }
      return data;
    }

    clearUserCache(): void {
      if (this.userCache && this.userCache.get('user')) {
        this.userCache.remove('user');
      }
    }
  }

  angular.module('auth').service('AuthCacheSvc', AuthCacheSvc);
}
