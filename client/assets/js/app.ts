/// <reference path='../../../typings/tsd.d.ts' />
module schlr {
  angular.module('schlr', [
      'auth',
      'common',
      'ngMessages',
      'ui.router',
      'ngAnimate',

      //foundation
      'foundation',
      'foundation.dynamicRouting',
      'foundation.dynamicRouting.animations'
    ])

    .constant('URLS', {
      'DEV': 'https://schlr-dev.stamplayapp.com',
      'PROD': 'https://schlr-dev.stamplayapp.com'
      // 'PROD': 'https://schlr.stamplayapp.com'
    })

    .config(function($urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise('/entries');

      $locationProvider.html5Mode({
        enabled: false,
        requireBase: false
      });

      $locationProvider.hashPrefix('!');
    })

    .run(function() {
      FastClick.attach(document.body);
    });
}
