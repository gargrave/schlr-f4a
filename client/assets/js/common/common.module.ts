/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  angular.module('common', []);

  export interface IGenericApiRes {
    data?: any;
    id?: string;
    name?: string;
    title?: string;

    created?: string;
    updated?: string;

    dt_create?: string;
    dt_update?: string;
  }
}
