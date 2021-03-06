/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.terms {

  export class TermsSvc extends app.common.AbstractSvc {

    static $inject = ['$http', '$q',
      'AuthSvc', 'UrlsSvc', 'F4ANotificationSvc', 'ApiUpdaterSvc'
    ];

    activeTerm: ITerm;

    constructor($http: ng.IHttpService,
                $q: ng.IQService,
                auth: auth.AuthSvc,
                urls: app.common.UrlsSvc,
                nots: app.wrappers.F4ANotificationSvc,
                private apiUpdater: app.common.ApiUpdaterSvc) {
      super($http, $q, auth, urls, nots, 'term');
      this.selectProps = ['name', 'startDate', 'endDate'];
    }

    /*=============================================
     = CRUD method callbacks
     =============================================*/
    afterQuerySuccess(res: any): void {
      this.entries = _.orderBy(this.entries, 'startDate', 'desc');
      this.activeTerm = this.activeTerm || this.entries[0];
    }

    /*=============================================
     = data mgmt methods
     =============================================*/
    getDefaultEntry(): any {
      return {
        name: '',
        startDate: '',
        endDate: ''
      };
    }

    getDataForCreate(entry: any): any {
      return {
        name: entry.name,
        startDate: entry.startDate,
        endDate: entry.endDate
      };
    }

    /*=============================================
     = activeTerm methods
     =============================================*/
    setActiveTerm(term: any): void {
      if (!_.isEqual(term, this.activeTerm)) {
        this.activeTerm = term;
        this.apiUpdater.requestUpdate();
      }
    }

    getActiveTerm(): ITerm {
      return this.activeTerm;
    }
  }

  angular.module('schlr').service('TermsSvc', TermsSvc);
}
