/// <reference path="../../../../typings/tsd.d.ts" />
module schlr {

  export class MasterSvc implements app.common.IMasterSvc {

    static $inject = [
      'TermsSvc', 'CoursesSvc', 'EntriesSvc',
      'ApiUpdaterSvc'
    ];

    // whether the controller is currently in 'initializing' state
    loading: boolean = false;

    constructor(private termsSvc: schlr.terms.TermsSvc,
                private coursesSvc: schlr.courses.CoursesSvc,
                private entriesSvc: schlr.entries.EntriesSvc,
                private apiUpdater: app.common.ApiUpdaterSvc) {
    }

    /*==============================================
     = IMasterSvc implementation
     ==============================================*/
    queryAll(): void {
      this.loading = true;
      this.apiUpdater.broadcastBeforeUpdate();
      this.queryTermsSvc();
    }

    clearAll(): void {
      this.entriesSvc.clearLocalData();
      this.coursesSvc.clearLocalData();
      this.termsSvc.clearLocalData();
    }

    finish(): void {
      this.loading = false;
      this.apiUpdater.broadcastAfterUpdate();
    }

    isLoading(): boolean {
      return this.loading;
    }

    /*==============================================
     = query methods
     ==============================================*/
    queryTermsSvc(): void {
      if (this.termsSvc.needsToUpdate()) {
        this.termsSvc.queryRefresh()
          .then((res) => {
          })
          .finally(() => {
            this.queryCoursesSvc();
          });
      } else {
        this.queryCoursesSvc();
      }
    }

    queryCoursesSvc(): void {
      if (this.coursesSvc.needsToUpdate()) {
        this.coursesSvc.queryRefresh()
          .then((res) => {
          })
          .finally(() => {
            this.queryEntriesSvc();
          });
      } else {
        this.queryEntriesSvc();
      }
    }

    queryEntriesSvc(): void {
      if (this.entriesSvc.needsToUpdate()) {
        // add the active term as a param, assuming we have one
        if (this.termsSvc.activeTerm) {
          let params = 'term=' + this.termsSvc.activeTerm.id;
          this.entriesSvc.setParamsString(params);
        }
        this.entriesSvc.queryRefresh()
          .then((res) => {
          })
          .finally(() => {
            this.finish();
          });
      } else {
        this.finish();
      }
    }
  }

  angular.module('schlr').service('MasterSvc', MasterSvc);
}
