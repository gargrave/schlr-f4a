/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  export class AuthCtrl {

    static $inject = ['$scope', 'AuthSvc'];

    // login email address; bound in the view's login form
    email: string;
    // login password; bound in the view's login form
    password: string;
    // any error messages that we need to show
    error: string = '';

    constructor(private $scope,
                private auth: auth.AuthSvc) {
      this.email = '';
      this.password = '';
      this.error = '';
    }

    /**
     * Attempts to authenticate the user with the current email/password model.
     *
     * @param form A reference to the login form
     */
    login(form: any): void {
      form.$submitted = true;
      if (form.$valid) {
        this.auth.login(this.email, this.password)
          .then((res) => {
            this.error = '';
          }, (err) => {
            this.error = 'There was an error logging you in. Please try again.';
          });
      }
    };

    /**
     * Logs out the currently authenticated user.
     */
    logout(): void {
      this.auth.logout();
      this.email = '';
      this.password = '';
      this.error = '';
    };

    /**
     * @returns {string} The display name of the currently authenticated user
     */
    userName(): string {
      return this.auth.user.displayName;
    };

    /**
     * @returns {string} The email address of the currently authenticated user
     */
    userEmail(): string {
      return this.auth.user.email;
    };

    /**
     * @returns {boolean} Whether the current user is authenticated
     */
    isLoggedIn(): boolean {
      return this.auth.isLoggedIn();
    };
  }

  angular.module('auth').controller('AuthCtrl', AuthCtrl);
}
