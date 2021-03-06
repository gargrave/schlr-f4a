/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export abstract class AbstractSvc {

    // the locally-stored copy of the entries for this service
    entries: any;

    // flags for keeping track of pending 'query()' requests
    protected deferredQuery: any;
    protected pendingQuery: boolean = false;
    // the base URL for this module's API
    protected crudApiUrl: string;
    protected needsUpdate: boolean;
    protected paramsString: string;
    protected selectProps: string[] = [];

    constructor(protected $http: ng.IHttpService,
                protected $q: ng.IQService,
                protected auth: auth.AuthSvc,
                protected urls: app.common.UrlsSvc,
                protected nots: app.wrappers.F4ANotificationSvc,
                protected moduleName: string) {
      this.crudApiUrl = urls.apiCrudBaseUrl + '/' + moduleName;
      this.needsUpdate = true;
    }

    /**
     * Builds the params string (if any) for the current request
     *
     * @returns {string} The params string (if any) for the current request
     */
    protected getQueryParamsString(): string {
      let params = '';
      // build the initial string
      if (this.paramsString) {
        params += `?${this.paramsString}`;
      }
      // build 'select' string
      if (this.selectProps.length > 0) {
        if (params.charAt(0) === '?') {
          params += '&';
        } else {
          params += '?';
        }
        params += `select=${this.selectProps.join(',')}`;
      }
      return params;
    }

    /*=============================================
     = CRUD methods
     =============================================*/
    /**
     * Sends a POST request to the API to create a new resource with the provided data.
     *
     * The return value from the POST/Create API is a copy of the object
     * we just created, held in a 'data' property.
     *
     * @param {*} data  The data for creating the new resource
     * @returns {IPromise}
     */
    save(data: any): ng.IPromise<any> {
      let deferred = this.$q.defer();

      // send request
      let submission = this.getDataForCreate(data);
      this.$http.post(this.crudApiUrl, submission, this.auth.getRequestHeaders())
        .then((postRes) => {
          let entry = postRes.data;
          this.afterSaveSuccess(entry);
          deferred.resolve(entry);
        }, (err) => {
          this.afterSaveError(err);
          deferred.reject(err);
        })
        .finally(() => {
        });
      return deferred.promise;
    }

    save2(data: any): ng.IPromise<any> {
      let deferred = this.$q.defer();

      // send request
      this.$http.post(this.crudApiUrl, data, this.auth.getRequestHeaders())
        .then((postRes) => {
          let entry = postRes.data;
          this.afterSaveSuccess(entry);
          deferred.resolve(entry);
        }, (err) => {
          this.afterSaveError(err);
          deferred.reject(err);
        })
        .finally(() => {
        });
      return deferred.promise;
    }

    /**
     * Runs a GET request to fetch all resources of this type for the current owner.
     *
     * @param {Boolean} forceRefresh - Whether we should run the request even if we already
     *    have cahced data (i.e. if the data needs to be updated)
     * @returns {IPromise}
     */
    query(forceRefresh: boolean = false): ng.IPromise<any> {
      if (!this.pendingQuery) {
        // if we already have results and we do not need to refresh the data,
        // simply return the existing data; otherwise, send a request to the API
        if (this.hasValidCache() && !forceRefresh) {
          this.deferredQuery = this.$q.defer();
          this.deferredQuery.resolve(this.entries);
        } else {
          // setup request
          const url = this.crudApiUrl + `/find/owner` + this.getQueryParamsString();
          this.deferredQuery = this.$q.defer();
          this.pendingQuery = true;

          // send request
          this.$http.get(url, this.auth.getRequestHeaders())
            .then((res) => {
              this.entries = res.data['data'];
              this.afterQuerySuccess(this.entries);
              this.deferredQuery.resolve(this.entries);
              this.deferredQuery = null;
              this.needsUpdate = false;
              this.pendingQuery = false;
            }, (err) => {
              this.afterQueryError(err);
              this.deferredQuery.reject(err);
            })
            .finally(() => {
            });
        }
      }
      this.setParamsString('');
      return this.deferredQuery.promise;
    }

    /**
     * Performs a forced refresh query with loading screen hidden.
     *
     * @returns {IPromise}
     */
    queryRefresh(): ng.IPromise<any> {
      this.clearLocalData();
      return this.query(true);
    }

    /**
     * Runs a GET request to fetch the resource with the specified ID.
     *
     * @param id {string} The ID of the resource to update
     * @param forceRefresh {boolean} Whether we should run the request even if we already
     *    have cahced data (i.e. if the data needs to be updated)
     * @returns {IPromise<*>}
     */
    get(id: string, forceRefresh: boolean = false): ng.IPromise<any> {
      let deferred = this.$q.defer();

      // if we already have results for this user, search those for the resource
      // otherwise, just do a GET request for the single resource we are looking for
      if (this.hasValidCache() && !forceRefresh) {
        let foundEntry = this.findEntryById(id);
        if (foundEntry) {
          deferred.resolve(foundEntry);
        } else {
          deferred.reject(`No entry could be found with matching ID: ${id}`);
        }
      } else {
        // setup request
        const url = this.crudApiUrl + '/' + id;

        // send request
        this.$http.get(url, this.auth.getRequestHeaders())
          .then((res) => {
            this.afterGetSuccess(res);
            deferred.resolve(res.data);
          }, (err) => {
            this.afterGetError(err);
            deferred.reject(`No entry could be found with matching ID: ${id}`);
          })
          .finally(() => {
          });
      }
      return deferred.promise;
    }

    /**
     * Runs a PUT request to update the specified resource.
     *
     * @param id {string} The ID of the resource to update
     * @param data {*} An object containing the data to be updated
     * @returns {IPromise<*>}
     */
    update(id: string, data: any): ng.IPromise<any> {
      let deferred = this.$q.defer();
      // set up request
      const url = this.crudApiUrl + `/${id}`;

      // add the current owner to this object, as the API will not do this automatically
      data.owner = this.auth.getUserId();
      // send request
      this.$http.put(url, data, this.auth.getRequestHeaders())
        .then((putRes) => {
          // see if we have can find a local copy of this entry and update it directly
          // if not, just do a fresh query
          let foundEntry = this.findEntryById(id);
          if (foundEntry) {
            for (let i in data) {
              if (data.hasOwnProperty(i) && foundEntry.hasOwnProperty(i)) {
                foundEntry[i] = data[i];
              }
            }
            this.afterUpdateSuccess(id, putRes);
            deferred.resolve(putRes.data);
          } else {
            this.query(true)
              .then((queryRes) => {
                this.afterUpdateSuccess(id, putRes);
                deferred.resolve(putRes.data);
              });
          }
        }, (err) => {
          this.afterUpdateError(id, err);
          deferred.reject(err);
        })
        .finally(() => {
        });
      return deferred.promise;
    }

    /**
     * Runs a DELETE query on the specified resource.
     *
     * The return value from the DELETE API is a top-level
     * copy of the object we just deleted.
     *
     * @param id {string} The id for the resource to delete
     * @returns {IPromise<*>}
     */
    remove(id: string): ng.IPromise<any> {
      let deferred = this.$q.defer();
      // setup request
      const url = this.crudApiUrl + `/${id}`;

      // send request
      this.$http.delete(url, this.auth.getRequestHeaders())
        .then((deleteRes) => {
          this.afterRemoveSuccess(id, deleteRes);
          deferred.resolve(deleteRes.data);
        }, (err) => {
          this.afterRemoveError(id, err);
          deferred.reject(err);
        })
        .finally(() => {
        });
      return deferred.promise;
    }

    /*=============================================
     = CRUD method callbacks
     =============================================*/
    /**
     * Callback after a successfull query() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     */
    afterQuerySuccess(res: any): void {
    }

    afterGetSuccess(res: any): void {
    }

    /**
     * Callback after a successfull save() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param res The newly created entry object
     */
    afterSaveSuccess(res: any): void {
      this.entries.push(res);
      this.nots.showInfo({
        title: 'Success!',
        content: `New ${this.moduleName} successfully saved.`
      });
    }

    /**
     * Callback after a successfull update() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param id The id of the affected entry
     * @param res The updated entry object
     */
    afterUpdateSuccess(id: string, res: any): void {
      this.nots.showInfo({
        title: 'Success!',
        content: `The ${this.moduleName} was successfully updated.`
      });
    }

    /**
     * Callback after a successfull remove() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param id The id of the affected entry
     * @param res The removed entry object
     */
    afterRemoveSuccess(id: string, res: any): void {
      // update the local list by removing the deleted entry
      this.entries = _.reject(this.entries, (e: any) => {
        return e.id === id;
      });
      this.nots.showInfo({
        title: 'Success!',
        content: `The ${this.moduleName} was successfully deleted.`
      });
    }

    afterQueryError(res: any): void {
      this.nots.showAlert({
        title: 'Error!',
        content: `Something went wrong trying to query the server.`
      });
    }

    afterGetError(res: any): void {
      this.nots.showAlert({
        title: 'Error!',
        content: `Something went wrong trying to find the entry.`
      });
    }

    /**
     * Callback after a successfull save() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param res The newly created entry object
     */
    afterSaveError(res: any): void {
      this.nots.showAlert({
        title: 'Error!',
        content: `Something went wrong trying to save the entry.`
      });
    }

    /**
     * Callback after a successfull update() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param id The id of the affected entry
     * @param res The updated entry object
     */
    afterUpdateError(id: string, res: any): void {
      this.nots.showAlert({
        title: 'Error!',
        content: `Something went wrong trying to update the entry.`
      });
    }

    /**
     * Callback after a successfull remove() request. Anything a child class needs
     * to do before resolving the promise can be done here.
     *
     * @param id The id of the affected entry
     * @param res The removed entry object
     */
    afterRemoveError(id: string, res: any): void {
      this.nots.showAlert({
        title: 'Error!',
        content: `Something went wrong trying to delete the entry.`
      });
    }

    /*=============================================
     = data mgmt methods
     =============================================*/
    /**
     * Returns a default/empty entry for this service. Default implementation provides
     * basic values, but most services will probably need to override to get more specific.
     *
     * @returns {Object}
     */
    getDefaultEntry(): any {
      return {
        name: ''
      };
    }

    getDataForCreate(entry: any): any {
    }

    buildDataForUpdate(entry: any): any {
    }

    /*=============================================
     = utility methods
     =============================================*/
    /**
     * @returns {number} The current number of entries in the local copy of the data
     */
    entryCount(): number {
      let count = 0;
      if (this.entries) {
        count = this.entries.length;
      }
      return count;
    }

    /**
     * Searches the local copy of the entries and attempts to find/return
     * an entry with a matching id-string.
     *
     * @param id {string} The id-string to search for
     * @returns {*} The matched object if found; otherwise undefined.
     */
    findEntryById(id: string): any {
      let found = _.find(this.entries, (e: any) => {
        return e.id === id;
      });
      return found;
    }

    /**
     * @returns {boolean} Whether we have cached data belonging to the current
     *    user we can can, or if we need to query the API again.
     */
    hasValidCache(): boolean {
      return this.entries !== undefined && this.entries.length > 0;
    }

    /**
     * Clears any locally-stored data.
     */
    clearLocalData(): void {
      this.entries = [];
      this.needsUpdate = true;
    }

    /**
     * @returns {boolean} Whether the service needs to query the API to update its data
     */
    needsToUpdate(): boolean {
      return this.needsUpdate;
    }

    /**
     * Sets the flag that will cause this service to re-query its API.
     */
    flagForUpdate(): void {
      this.needsUpdate = true;
    }

    setParamsString(params: string): void {
      this.paramsString = params;
    }
  }
}
