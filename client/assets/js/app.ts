/// <reference path='../../../typings/tsd.d.ts' />
module schlr {
  angular.module('schlr', [
      'auth',
      'common',
      'f4a-wrappers',
      'ngMessages',
      'ui.router',
      'ngAnimate',

      //foundation
      'foundation',
      'foundation.dynamicRouting',
      'foundation.dynamicRouting.animations'
    ])

    .constant('URLS', {
      'DEV': 'URL_FOR_DEV_API',
      'PROD': 'URL_FOR_PRODUCTION_API'
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
