/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export interface IMasterSvc {
    queryAll(): void;
    clearAll(): void;
    finish(): void;
    isLoading(): boolean;
  }
}
