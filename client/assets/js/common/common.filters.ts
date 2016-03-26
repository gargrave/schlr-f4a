module app.common {

  /*
   * Translates true/false values into Yes/No strings.
   */
  export function BooleanFilter(): any {
    return function(input: any) {
      let str = input || '';
      return str.toString().toLowerCase() === 'true' ? 'Yes' : 'No';
    };
  }

  /**
   * Displays a time in the past in 'x years, x weeks, x days ago' format.
   *
   * Note that months are not accounting for, since the difference in months'
   * lengths would make it way more complicated than necessary.
   */
  export function DaysAgoFilter(): any {
    return function(input: any) {
      let today: Date = new Date();
      let todayDate: Date = new Date(
        today.getFullYear(), today.getMonth(), today.getDate());
      let lastDate: Date = new Date(input);
      let diff: number = lastDate.getTime() - todayDate.getTime();
      let days = Math.abs(Math.round((diff / (1000 * 60 * 60 * 24))));
      let retStr: string;

      // how many years?
      let years = 0;
      while (days >= 365) {
        days -= 365;
        years += 1;
      }
      let yearsStr = '';
      if (years > 0) {
        yearsStr = years === 1 ?
          '1 year' : `${years} years`;
      }
      // how many weeks?
      let weeks = 0;
      while (days >= 7) {
        days -= 7;
        weeks += 1;
      }
      let weeksStr = '';
      if (weeks > 0) {
        // set the string according to how many years
        if (years === 0) {
          weeksStr = weeks === 1 ?
            '1 week' : `${weeks} weeks`;
        } else {
          weeksStr = weeks === 1 ?
            ', 1 week' : `, ${weeks} weeks`;
        }
      }

      // now build the days string; lots of different wording to account for...
      let daysStr = '';
      if (years === 0 && weeks === 0) {
        // less than one week, just show days
        if (days === 0) {
          daysStr = 'today';
        } else if (days === 1) {
          daysStr = 'yesterday';
        } else {
          daysStr = `${days} days ago`;
        }
      } else if (years > 0 || weeks > 0) {
        // less than one year, but more than one week
        if (days === 0) {
          daysStr = ' ago';
        } else if (days === 1) {
          daysStr = ', 1 day ago';
        } else {
          daysStr = `, ${days} days ago`;
        }
      }

      retStr = `${yearsStr}${weeksStr}${daysStr}`;
      return retStr;
    };
  }

  angular.module('common').filter('boolean', BooleanFilter);
  angular.module('common').filter('daysAgo', DaysAgoFilter);
}
