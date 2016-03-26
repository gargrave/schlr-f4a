/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export class ApiUpdaterSvc {

    static $inject = ['$rootScope'];

    constructor(private $rootScope) {
    }

    requestUpdate() {
      this.$rootScope.$broadcast('requestUpdate');
    }

    listenForUpdateRequest(callback) {
      this.$rootScope.$on('requestUpdate', callback);
    }

    broadcastBeforeUpdate() {
      this.$rootScope.$broadcast('beforeUpdate');
    }

    listenForBeforeUpdate(callback) {
      this.$rootScope.$on('beforeUpdate', callback);
    }

    broadcastAfterUpdate() {
      this.$rootScope.$broadcast('afterUpdate');
    }

    listenForAfterUpdate(callback) {
      this.$rootScope.$on('afterUpdate', callback);
    }
  }

  angular.module('common').service('ApiUpdaterSvc', ApiUpdaterSvc);
}
