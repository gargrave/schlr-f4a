/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.courses {

  import ITerm = schlr.terms.ITerm;
  import TermsSvc = schlr.terms.TermsSvc;

  class TermWrapper {
    term: ITerm;
    name: string;
    startDate: string;
    endDate: string;
    courses: ICourse[] = [];

    constructor(term: ITerm) {
      this.term = term;
      this.name = term.name;
      this.startDate = term.startDate;
      this.endDate = term.endDate;
    }

    addCourse(course: ICourse) {
      this.courses.push({
        id: course.id,
        name: course.name,
        fullName: course.fullName,
        term: this.term
      });
    }
  }

  export interface ICourse extends app.common.IGenericApiRes {
    term?: schlr.terms.ITerm;
    fullName?: string;
  }

  export class CoursesCtrl extends app.common.AbstractCtrl {

    static $inject = [
      '$scope', '$state', '$stateParams',
      'AuthSvc', 'CoursesSvc',
      'MainSvc', 'TermsSvc', 'ApiUpdaterSvc'
    ];

    termsForSelect: any[];

    constructor($scope,
                $state: ng.ui.IStateService,
                $stateParams: ng.ui.IStateParamsService,
                auth: auth.AuthSvc,
                dataSvc: CoursesSvc,
                mainSvc: schlr.MainSvc,
                private termsSvc: TermsSvc,
                private apiUpdater: app.common.ApiUpdaterSvc) {
      super($scope, $state, $stateParams, auth, dataSvc, mainSvc, 'course');
      // add listener for master service updates
      apiUpdater.listenForAfterUpdate(() => {
        this.find();
      });
    }

    hasTerms(): any {
      return this.termsSvc.entryCount() > 0;
    }

    initListView(): void {
      if (!this.mainSvc.isLoading()) {
        this.termsSvc.query()
          .then((res) => {
            this.find();
          });
      }
    }

    initCreateView(): void {
      this.clearEntry();
      this.termsSvc.query()
        .then((res) => {
          this.termsForSelect = _.orderBy(res, 'startDate', 'desc');
          this.entry.term = this.termsForSelect[0];
          this.working = false;
        });
    }

    initUpdateView(): void {
      this.termsSvc.query()
        .then((res) => {
          this.findOne();
          this.termsForSelect = _.orderBy(res, 'startDate', 'desc');
          this.working = false;
        });
    }

    /*=============================================
     = CRUD helper methods
     =============================================*/
    canSaveUpdate(): boolean {
      return this.auth.isLoggedIn() &&
        (this.entry.name !== this.originalEntry.name ||
        this.entry.fullName !== this.originalEntry.fullName ||
        this.entry.term.id !== this.originalEntry.term.id);
    }

    getDataForUpdate(): any {
      return {
        name: this.entry.name,
        fullName: this.entry.fullName,
        term: this.entry.term.id
      };
    }

    // override to build a sort version of entries
    afterFind(res: any): void {
      this.entries = [];

      _.each(res, (item) => {
        let course: ICourse = <ICourse>item;
        let term: ITerm = this.termsSvc.findEntryById(course.term.toString());
        if (term) {
          // add course to the TermWrapper; either existing or create a new one
          let termWrapper = _.find(this.entries, (e: TermWrapper) => {
            return e.term.id === term.id;
          });
          if (!termWrapper) {
            termWrapper = new TermWrapper(term);
            this.entries.push(termWrapper);
          }
          termWrapper.addCourse(course);
        }
      });
    }

    // override to populate a 'term' object in our local entry
    afterFindOne(res: any): void {
      this.entry = angular.copy(res);
      this.entry.term = this.termsSvc.findEntryById(res.term.toString());
      this.originalEntry = angular.copy(this.entry);
    }
  }

  angular.module('schlr').controller('CoursesCtrl', CoursesCtrl);
}
