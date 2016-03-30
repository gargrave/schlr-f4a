/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.terms {

  export interface ITerm extends app.common.IGenericApiRes {
    startDate?: any;
    endDate?: any;
  }

  export class TermsCtrl extends app.common.AbstractCtrl {

    static $inject = [
      '$scope', '$state', '$stateParams',
      'AuthSvc', 'TermsSvc', 'MainSvc', 'ApiUpdaterSvc'
    ];

    constructor($scope,
                $state: ng.ui.IStateService,
                $stateParams: ng.ui.IStateParamsService,
                auth: auth.AuthSvc,
                dataSvc: TermsSvc,
                mainSvc: schlr.MainSvc,
                apiUpdater: app.common.ApiUpdaterSvc) {
      super($scope, $state, $stateParams, auth, dataSvc, mainSvc, apiUpdater, 'term');
    }

    /*=============================================
     = CRUD helper methods
     =============================================*/
    afterFindOne(res: any): void {
      this.entry = {
        id: res.id,
        name: res.name,
        startDate: new Date(res.startDate),
        endDate: new Date(res.endDate)
      };
      this.originalEntry = angular.copy(this.entry);
    }

    canSaveUpdate(): boolean {
      return this.auth.isLoggedIn() && this.entry !== undefined &&
        (this.entry.name !== this.originalEntry.name ||
        (!_.isEqual(this.entry.startDate, this.originalEntry.startDate)) ||
        (!_.isEqual(this.entry.endDate, this.originalEntry.endDate)));
    }

    getDataForUpdate(): any {
      return {
        name: this.entry.name,
        startDate: this.entry.startDate,
        endDate: this.entry.endDate
      };
    }
  }

  angular.module('schlr').controller('TermsCtrl', TermsCtrl);
}
