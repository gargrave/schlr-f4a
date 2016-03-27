/// <reference path="../../../../typings/tsd.d.ts" />
module schlr.entries {

  export class WeekContainer {
    // the number of this week in the term
    weekNumber: string;
    // the collection of CourseContainer objects for this week
    courses: ICourseContainer[] = [];
    // total number of entries in this week
    entryCount: number = 0;
    // number of entries contained within marked as 'finished'
    finishedCount: number = 0;
    // whether all entries have been marked as 'finished'
    complete: boolean = false;
    // whether this week should be hidden or "folded" in teh view
    hidden: boolean = false;

    constructor(weekNumber: string) {
      this.weekNumber = weekNumber;
    }

    /**
     * Updates the current finished count
     *
     * @param {boolean} finished Whether the count should be incremented or decremented
     */
    updateFinishedCount(finished: boolean): void {
      this.finishedCount += finished ? 1 : -1;
      this.updateComplete();
    }

    /**
     * Updates the status of 'complete' based on whether 'finishedCount' is equal to 'entryCount'
     */
    updateComplete(): void {
      this.complete = this.finishedCount === this.entryCount;
    }
  }
}
