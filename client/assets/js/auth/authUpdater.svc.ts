/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  export class AuthUpdaterSvc {

    static $inject = ['$rootScope'];

    constructor(private $rootScope: ng.IRootScopeService) {
    }

    /*==============================================
     = login events
     ==============================================*/
    listenForLoginStart(callback): void {
      this.$rootScope.$on('loginStart', callback);
    }

    listenForLoginEnd(callback): void {
      this.$rootScope.$on('loginEnd', callback);
    }

    broadcastLoginStart(): void {
      this.$rootScope.$broadcast('loginStart');
    }

    broadcastLoginEnd(): void {
      this.$rootScope.$broadcast('loginEnd');
    }

    /*==============================================
     = logout events
     ==============================================*/
    listenForLogoutStart(callback): void {
      this.$rootScope.$on('logoutStart', callback);
    }

    broadcastLogoutStart(): void {
      this.$rootScope.$broadcast('logoutStart');
    }

    listenForLogoutEnd(callback): void {
      this.$rootScope.$on('logoutEnd', callback);
    }

    broadcastLogoutEnd(): void {
      this.$rootScope.$broadcast('logoutEnd');
    }
  }

  angular.module('auth').service('AuthUpdaterSvc', AuthUpdaterSvc);
}
