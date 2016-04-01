/// <reference path="../../../../typings/tsd.d.ts" />
module app.wrappers {

  export class F4ANotificationSvc {

    static $inject = ['FoundationApi'];

    constructor(private foundationApi) {
    }

    private showNotification(config: any): void {
      this.foundationApi.publish('main-notifications', {
        title: config.title,
        content: config.content,
        color: config.color,
        autoclose: config.autoclose
      });
    }

    showSuccess(config: any): void {
      this.showNotification({
        title: config.title || '',
        content: config.content || '',
        color: 'success',
        autoclose: config.autoclose || '3000'
      });
    }

    showAlert(config: any): void {
      this.showNotification({
        title: config.title || '',
        content: config.content || '',
        color: 'alert',
        autoclose: config.autoclose || '3000'
      });
    }
  }

  angular.module('f4a-wrappers').service('F4ANotificationSvc', F4ANotificationSvc);
}
