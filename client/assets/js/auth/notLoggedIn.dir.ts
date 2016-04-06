/// <reference path="../../../../typings/tsd.d.ts" />
module auth {
  function notLoggedIn() {
    return {
      restrict: 'A',
      templateUrl: 'templates/partials/not-logged-in.html',
      controller: 'AuthCtrl',
      controllerAs: 'auth',

      link: ($scope, $element, $attributes): void => {
        $scope.show = !$scope.auth.isLoggedIn();
      }
    };
  }

  angular.module('auth').directive('notLoggedIn', notLoggedIn);
}
