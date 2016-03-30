/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.entries {

  export class EntriesSvc extends app.common.AbstractSvc {

    static $inject = ['$http', '$q',
      'AuthSvc', 'UrlsSvc', 'TermsSvc'
    ];

    private newEntryCourseId: string;
    private newEntryWeek: string;
    private newEntryTerm: string;

    constructor($http: ng.IHttpService,
                $q: ng.IQService,
                auth: auth.AuthSvc,
                urls: app.common.UrlsSvc,
                private termsSvc: schlr.terms.TermsSvc) {
      super($http, $q, auth, urls, 'entry');
      this.selectProps = ['name', 'finished', 'week', 'course', 'term'];
    }

    createEntry(data: any): ng.IPromise<any> {
      return this.save2({
        name: data.name,
        course: this.newEntryCourseId,
        week: this.newEntryWeek,
        term: this.newEntryTerm,
        finished: false
      });
    }

    multiSave(data: any): ng.IPromise<any> {
      let deferred = this.$q.defer();
      let expected = data.length; // API responses expected
      let received = 0; // actual count received

      _.each(data, (newEntryData) => {
        // build the data for each instance
        let entryData = {
          name: newEntryData.name,
          course: newEntryData.course,
          week: this.newEntryWeek,
          term: this.newEntryTerm,
          finished: false
        };
        // submit a POST request for each one
        this.$http.post(this.crudApiUrl, entryData, this.auth.getRequestHeaders())
          .then((postRes) => {
            let entry = postRes.data;
            this.entries.push(entry);
          }, (err) => {
            deferred.reject(err);
          })
          .finally(() => {
            // once we receive all responses, resolve!
            if (++received >= expected) {
              deferred.resolve(true);
            }
          });
      });
      return deferred.promise;
    }

    /*=============================================
     = CRUD method callbacks
     =============================================*/
    // override to only push a new entry into our local list when it is for this term
    afterSaveSuccess(entry: any): void {
      if (_.isEqual(entry.term.toString(), this.termsSvc.activeTerm.id)) {
        this.entries.push(entry);
      }
    }

    /*=============================================
     = data mgmt methods
     =============================================*/
    getDefaultEntry(): any {
      return {
        name: '',
        course: '',
        term: this.termsSvc.activeTerm.id,
        week: '',
        finished: false
      };
    }

    getDataForCreate(data: any): any {
      return {
        name: data.name,
        course: this.newEntryCourseId,
        week: this.newEntryWeek,
        term: this.newEntryTerm,
        finished: false
      };
    }

    buildDataForUpdate(entry: any): any {
      return {
        name: entry.name,
        week: this.newEntryWeek,
        term: this.newEntryTerm,
        course: this.newEntryCourseId,
        finished: entry.finished
      };
    }

    /*=============================================
     = New Entry helpers
     =============================================*/
    setNewEntryParams(termId: string, week: string, courseId: string): void {
      this.setNewEntryTerm(termId);
      this.setNewEntryWeek(week);
      this.setNewEntryCourseId(courseId);
    }

    setNewEntryTerm(term: string): void {
      this.newEntryTerm = term;
    }

    setNewEntryWeek(week: string): void {
      this.newEntryWeek = week;
    }

    setNewEntryCourseId(id: string): void {
      this.newEntryCourseId = id;
    }
  }

  angular.module('schlr').service('EntriesSvc', EntriesSvc);
}
