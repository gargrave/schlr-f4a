/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.courses {

  export class CoursesSvc extends app.common.AbstractSvc {

    static $inject = ['$http', '$q',
      'AuthSvc', 'UrlsSvc', 'TermsSvc', 'EntriesSvc'
    ];

    private activeCourses: ICourse[];

    constructor($http: ng.IHttpService,
                $q: ng.IQService,
                auth: auth.AuthSvc,
                urls: app.common.UrlsSvc,
                private termsSvc: schlr.terms.TermsSvc,
                private entriesSvc: schlr.entries.EntriesSvc) {
      super($http, $q, auth, urls, 'course');
      this.selectProps = ['name', 'fullName', 'term'];
    }

    /*=============================================
     = CRUD methods
     =============================================*/
    // override to automatically create a week-1 entry for any new course
    save(data: any): ng.IPromise<any> {
      let deferred = this.$q.defer();

      /*=============================================
       = Courses API request
       =============================================*/
      let submission = this.getDataForCreate(data);
      this.$http.post(this.crudApiUrl, submission, this.auth.getRequestHeaders())
        .then((postRes) => {
          let entry: any = postRes.data;
          this.entries.push(entry);

          /*=============================================
           = Entries API request
           =============================================*/
          // now create a new default entry for week 1 of this course
          this.entriesSvc.setNewEntryParams(entry.term, '1', entry.id);
          this.entriesSvc.createEntry({name: `New entry for ${entry.name}`})
            .then((entrySvcRes) => {
              deferred.resolve(entry);
            }, (err) => {
              deferred.reject(err);
            })
            .finally(() => {
            });
        }, (err) => {
          deferred.reject(err);
        })
        .finally(() => {
        });
      return deferred.promise;
    }

    /*=============================================
     = data mgmt methods
     =============================================*/
    getDefaultEntry(): any {
      return {
        name: '',
        fullName: '',
        term: '',
      };
    }

    getDataForCreate(entry: any): any {
      return {
        name: entry.name,
        fullName: entry.fullName,
        term: entry.term.id
      };
    }

    getActiveCourses(): ICourse[] {
      this.activeCourses = _.filter(this.entries, (e: any) => {
        return e.term.toString() === this.termsSvc.activeTerm.id;
      });
      return this.activeCourses;
    }
  }

  angular.module('schlr').service('CoursesSvc', CoursesSvc);
}
