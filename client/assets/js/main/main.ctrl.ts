/// <reference path="../../../../typings/tsd.d.ts" />
module schlr {

  export class MainCtrl {

    static $inject = [
      '$scope', '$state',
      'AuthSvc', 'AuthUpdaterSvc',
      'ApiUpdaterSvc', 'MainSvc'
    ];

    // whether the controller is currently in 'initializing' state
    initializing: boolean = false;

    constructor(private $scope: ng.IScope,
                private $state: ng.ui.IStateService,
                private auth: auth.AuthSvc,
                private authUpdater: auth.AuthUpdaterSvc,
                private apiUpdater: app.common.ApiUpdaterSvc,
                private mainSvc: MainSvc) {
      // add listeners for auth events
      authUpdater.listenForLoginStart(() => this.onLoginStart());
      authUpdater.listenForLoginEnd(() => this.onLoginEnd());
      authUpdater.listenForLogoutStart(() => this.onLogoutStart());
      authUpdater.listenForLogoutEnd(() => this.onLogoutEnd());
      apiUpdater.listenForUpdateRequest(() => this.onApiUpdateRequest());
      apiUpdater.listenForAfterUpdate(() => this.onApiAfterUpdate());

      // if we are already logged in, initialize the data
      if (this.isLoggedIn()) {
        this.initializeData();
      }
    }

    /*==============================================
     = auth event callbacks
     ==============================================*/
    /**
     * Callback for when auth service begins the login process.
     */
    onLoginStart(): void {
    }

    /**
     * Callback for when auth service completes the login process
     */
    onLoginEnd(): void {
      if (this.auth.isLoggedIn()) {
        this.initializeData();
      } else {
        this.finishInitialization();
      }
    }

    /**
     * Callback for when auth service begins the logout process.
     */
    onLogoutStart(): void {
      this.mainSvc.clearAll();
    }

    /**
     * Callback for when auth service completes the login process
     */
    onLogoutEnd(): void {
    }

    /*==============================================
     = API updater callbacks
     ==============================================*/
    onApiUpdateRequest(): void {
      this.initializeData();
    }

    onApiAfterUpdate(): void {
      this.finishInitialization();
    }

    /*==============================================
     = auth utility callbacks
     ==============================================*/
    /**
     * @returns {boolean} Whether the user is currently authenticated.
     */
    isLoggedIn() {
      return this.auth.isLoggedIn();
    }

    /**
     * Redirects the user to the login page.
     */
    goToLogin(): void {
      this.$state.go('home.account');
    };

    /*==============================================
     = data handling methods
     ==============================================*/
    initializeData(): void {
      this.mainSvc.queryAll();
    }

    finishInitialization(): void {
      this.initializing = false;
    }
  }

  angular.module('schlr').controller('MainCtrl', MainCtrl);
}
