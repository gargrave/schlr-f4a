/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.entries {

  export interface IEntry extends app.common.IGenericApiRes {
    course?: string;
    term?: string;
    week?: string;
    finished?: boolean;
  }

  /*
   The container type used to represent a course within a specific week in our sorted entries list.
   */
  export interface ICourseContainer {
    id?: string;
    // the name of the course; this will be used as the key
    name?: string;
    // the collection of entry objects for this course
    entries?: any[];
  }

  export class EntriesCtrl extends app.common.AbstractCtrl {

    static $inject = [
      '$scope', '$state', '$stateParams',
      'AuthSvc', 'EntriesSvc', 'MainSvc',
      'CoursesSvc', 'TermsSvc', 'ApiUpdaterSvc'
    ];

    weekContainers: any;

    private entriesSvc: EntriesSvc;
    private activeTerm: schlr.terms.ITerm;
    private highestWeek: number = 0;
    private activeCourses: any[];

    constructor($scope,
                $state: ng.ui.IStateService,
                $stateParams: ng.ui.IStateParamsService,
                auth: auth.AuthSvc,
                dataSvc: EntriesSvc,
                mainSvc: schlr.MainSvc,
                private coursesSvc: schlr.courses.CoursesSvc,
                private termsSvc: schlr.terms.TermsSvc,
                private apiUpdater: app.common.ApiUpdaterSvc) {
      super($scope, $state, $stateParams, auth, dataSvc, mainSvc, 'entry');
      // dataSvc as EntriesSvc for local use
      this.entriesSvc = <EntriesSvc>dataSvc;

      apiUpdater.listenForBeforeUpdate(() => {
        this.onBeforeApiUpdate();
      });

      apiUpdater.listenForAfterUpdate(() => {
        this.onAfterApiUpdate();
      });
    }

    /*=============================================
     = ionic view callbacks
     =============================================*/
    initListView(): void {
      if (!this.mainSvc.isLoading()) {
        this.buildLocalEntryList();
      }
    }

    onBeforeApiUpdate() {
      let activeTermOnSvc = this.termsSvc.getActiveTerm();
      if (activeTermOnSvc !== undefined && this.activeTerm !== activeTermOnSvc) {
        this.activeTerm = activeTermOnSvc;
        this.entries = [];
        this.weekContainers = [];
        this.entriesSvc.flagForUpdate();
      }
    }

    onAfterApiUpdate() {
      this.buildLocalEntryList();
    }

    /*=============================================
     = Local data utility methods
     =============================================*/
    private buildLocalEntryList(): void {
      this.termsSvc.query()
        .then((res) => {
          this.activeTerm = this.termsSvc.getActiveTerm();
          // let params = '?term=' + this.activeTerm.id;
          this.dataSvc.setParamsString('term=' + this.activeTerm.id);
          this.find(false);
        });
    }

    /**
     * Returns the weekNumber container related to the specified weekNumber number. If none exists
     * yet, a new one is created and returned.
     *
     * @param {String} weekNumber - The week number as a string
     * @returns {WeekContainer}
     */
    private getWeekForEntry(weekNumber: string): WeekContainer {
      // try to find existing WeekContainer based on weekNumber number key
      let week: WeekContainer = _.find(this.weekContainers, (e: any) => {
        return e.weekNumber === weekNumber;
      });
      // otherwise create and return an empty one
      if (!week) {
        week = new WeekContainer(weekNumber);
        this.weekContainers.push(week);
      }
      return week;
    }

    /**
     * Returns the course container object to use for the specified week/course combo.
     * If no course matching these criteria exists yet, a new one will be created.
     *
     * @param {WeekContainer} weekContainer - The container for the week to which this course belongs.
     * @param course - The course in question
     * @returns {ICourseContainer}
     */
    private getCourseForEntry(weekContainer: WeekContainer, course: any): ICourseContainer {
      // try to find existing ICourseContainer based on week number key
      let foundCourse: ICourseContainer = _.find(weekContainer.courses, (c: any) => {
        return c.name === course.name;
      });
      // otherwise create and return an empty one
      if (!foundCourse) {
        foundCourse = {
          id: course.id,
          name: course.name,
          entries: []
        };
        weekContainer.courses.push(foundCourse);
      }
      return foundCourse;
    }

    /*=============================================
     = Modal/Popover methods
     =============================================*/
    /**
     * Shows the entry creation view.
     */
    showEntryCreate(week: string, courseId: string) {
      // TODO: replace entry create/update modal
      // this.entryModalSvc.showForCreate(this.activeTerm.id, week, courseId);
    }

    /**
     * Shows the entry update view.
     */
    showEntryUpdate(entry: IEntry) {
      // TODO: replace entry create/update modal
      // this.entryModalSvc.showForUpdate(entry);
    }

    /**
     * Callback method for modals being hidden.
     */
    onModalHidden(): void {
      this.buildLocalEntryList();
    }

    showTermPopover($event): void {
      // TODO: replace term popover service
      // this.termPopoverSvc.show($event);
    }

    /*=============================================
     = Entry mgmt methods
     =============================================*/
    /**
     * Reverses the state of 'finished' for the specified Entry.
     * @param {IEntry} clickedEntry - The Entry whose 'finished' state need to be toggled.
     */
    updateFinishedState(clickedEntry: IEntry): void {
      this.entry = clickedEntry;
      this.entry.finished = !this.entry.finished;
      let week = _.find(this.weekContainers, (w: WeekContainer) => {
        return w.weekNumber === clickedEntry.week;
      });
      if (week) {
        week.updateFinishedCount(this.entry.finished);
      }
      this.entriesSvc.update(this.entry.id, this.getDataForUpdate());
    }

    /*=============================================
     = Week mgmt methods
     =============================================*/
    /**
     * Adds a new week to the top of the list with default entries for each course
     */
    addWeek(): void {
      this.highestWeek += 1;
      this.entriesSvc.setNewEntryWeek(this.highestWeek.toString());
      this.entriesSvc.setNewEntryTerm(this.activeTerm.id);
      let newEntriesData = [];
      // build the required entry data for each course
      _.each(this.activeCourses, (c: any) => {
        newEntriesData.push({
          name: `New entry for ${c.name}`,
          course: c.id
        });
      });

      this.entriesSvc.multiSave(newEntriesData)
        .then((res) => {
          this.buildLocalEntryList();
        });
    }

    /**
     * Toggles the visibility of the entries for the specified week.
     *
     * @param {Number} weekNum - THe number of week for which visiblity should be toggled.
     */
    toggleWeekHidden(weekNum: number): void {
      let found = _.find(this.weekContainers, (e: any) => {
        return e.weekNumber === weekNum;
      });
      if (found) {
        found.hidden = !found.hidden;
      }
    }

    /*=============================================
     = CRUD helper methods
     =============================================*/
    submit(form: any): void {
      this.create(form);
    }

    canSaveUpdate(): boolean {
      return this.auth.isLoggedIn() &&
        (this.entry.name !== this.originalEntry.name ||
        this.entry.finished !== this.originalEntry.finished);
    }

    getDataForUpdate(): any {
      return {
        name: this.entry.name,
        week: this.entry.week,
        term: this.entry.term,
        course: this.entry.course.id,
        finished: this.entry.finished
      };
    }

    afterFind(res: any): void {
      this.weekContainers = [];
      this.highestWeek = 0;
      this.activeCourses = this.coursesSvc.getActiveCourses();

      _.each(res, (item) => {
        let entry: IEntry = <IEntry>item;
        let course = this.coursesSvc.findEntryById(entry.course.toString());

        // there is a possibility of entries continuing to exist after their course
        // is delete, so if we do not have an existing course, ignore this entry
        if (course) {
          // ensure that we have a valid week/course heirarchy before proceeding
          let foundWeek = this.getWeekForEntry(entry.week);
          let foundCourse = this.getCourseForEntry(foundWeek, course);

          // set the current highest week number
          let entryWeekNum: number = Number(entry.week);
          if (entryWeekNum > this.highestWeek) {
            this.highestWeek = entryWeekNum;
          }

          foundWeek.entryCount += 1;
          if (entry.finished) {
            foundWeek.finishedCount += 1;
          }
          foundWeek.complete = (foundWeek.entryCount === foundWeek.finishedCount);
          foundWeek.hidden = foundWeek.complete;

          foundCourse.entries.push({
            id: entry.id,
            name: entry.name,
            week: entry.week,
            term: entry.term,
            course: course,
            finished: entry.finished
          });
        }
      });

      // ensure now that each week has every course in use, even if it is empty
      _.each(this.weekContainers, (e: any) => {
        _.each(this.activeCourses, (c: any) => {
          this.getCourseForEntry(e, c);
        });
      });

      // sort by week, with most current first
      this.weekContainers = _.orderBy(this.weekContainers, 'weekNumber', 'desc');
    }
  }

  angular.module('schlr').controller('EntriesCtrl', EntriesCtrl);
}
