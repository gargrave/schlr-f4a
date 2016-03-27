/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export interface IMainSvc {
    queryAll(): void;
    clearAll(): void;
    finish(): void;
    isLoading(): boolean;
  }
}
