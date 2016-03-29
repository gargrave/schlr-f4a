/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.terms {

  export class TermSelectModalCtrl {

    static $inject = ['TermsSvc', 'MainSvc'];

    constructor(private termsSvc: schlr.terms.TermsSvc,
                private mainSvc: schlr.MainSvc) {
    }

    terms(): any {
      return this.termsSvc.entries;
    }

    onTermSelected(term: ITerm) {
      this.termsSvc.setActiveTerm(term);
    }
  }

  angular.module('schlr').controller('TermSelectModalCtrl', TermSelectModalCtrl);
}
