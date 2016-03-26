/// <reference path="../../../../typings/tsd.d.ts" />
module auth {

  angular.module('auth', ['ngCookies', 'angular-cache']);

  /*
   * UserData helper class; contains information on the
   * currently-logged in user.
   */
  export class UserData {

    id: string; // user id number (pk)
    email: string; // user email (unique, used to log in)
    displayName: string; // user display name (non-unqiue)

    constructor(id: string = '',
                email: string = '',
                displayName: string = '') {
      this.set(id, email, displayName);
    }

    set(id: string,
        email: string,
        displayName: string): void {
      this.id = id;
      this.email = email;
      this.displayName = displayName;
    }

    reset(): void {
      this.id = '';
      this.displayName = '';
      this.email = '';
    }
  }
}
