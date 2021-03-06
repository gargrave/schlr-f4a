/// <reference path="../../../../typings/tsd.d.ts" />
module app.common {

  export abstract class AbstractCtrl {

    entry: any;
    entries: any[] = [];
    originalEntry: any;
    filterText: string;
    working: boolean;
    showSearch: boolean;

    constructor(protected $scope: ng.IScope,
                protected $state: ng.ui.IStateService,
                protected $stateParams: ng.ui.IStateParamsService,
                protected auth: auth.AuthSvc,
                protected dataSvc: app.common.AbstractSvc,
                protected mainSvc: app.common.IMainSvc,
                protected apiUpdater: app.common.ApiUpdaterSvc,
                protected moduleName: string) {
      this.filterText = '';
      this.working = true;
      this.showSearch = false;

      // add listeners for master service updates
      apiUpdater.listenForBeforeUpdate(() => {
        this.onBeforeApiUpdate();
      });
      apiUpdater.listenForAfterUpdate(() => {
        this.onAfterApiUpdate();
      });
    }

    /*==============================================
     = API update callbacks
     ==============================================*/
    onBeforeApiUpdate() {
    }

    onAfterApiUpdate() {
      if (this.isListView()) {
        this.find();
      } else if (this.isDetailView() || this.isUpdateView()) {
        this.findOne();
      }
    }

    /*=============================================
     = view state-checking methods
     =============================================*/
    isListView(): boolean {
      return this.$state.is(`home.${this.moduleName}-list`);
    }

    isDetailView(): boolean {
      return this.$state.is(`home.${this.moduleName}-detail`);
    }

    isUpdateView(): boolean {
      return this.$state.is(`home.${this.moduleName}-update`);
    }

    isCreateView(): boolean {
      return this.$state.is(`home.${this.moduleName}-create`);
    }

    /*=============================================
     = view init methods
     =============================================*/
    initListView(): void {
      if (!this.mainSvc.isLoading()) {
        this.find();
      }
    }

    initDetailView(): void {
      if (!this.mainSvc.isLoading()) {
        this.findOne();
      }
    }

    initUpdateView(): void {
      if (!this.mainSvc.isLoading()) {
        this.findOne();
      }
    }

    initCreateView(): void {
      this.clearEntry();
      this.working = false;
    }

    /*=============================================
     = CRUD methods
     =============================================*/
    create(form?): void {
      if (this.auth.isLoggedIn()) {
        if (form) {
          form.$submitted = true;
        }
        if (!form || (form && form.$valid)) {
          this.working = true;
          this.dataSvc.save2(this.entry)
            .then((res) => {
              this.afterCreate(res);
              this.working = false;
            });
        }
      }
    }

    find(forceRefresh: boolean = false): void {
      if (this.auth.isLoggedIn()) {
        this.entries = [];
        this.working = true;
        this.dataSvc.query(forceRefresh)
          .then((res) => {
            this.afterFind(res);
          })
          .finally(() => {
            this.working = false;
          });
      }
    }

    findOne(): void {
      if (this.auth.isLoggedIn()) {
        this.working = true;
        this.dataSvc.get(this.$stateParams['id'])
          .then((res) => {
            this.afterFindOne(res);
            this.working = false;
          });
      }
    }

    update(form?): void {
      if (this.auth.isLoggedIn()) {
        if (form) {
          form.$submitted = true;
        }
        if (!form || (form && form.$valid)) {
          if (this.canSaveUpdate()) {
            const data: any = this.getDataForUpdate();
            const id: string = this.entry.id;
            this.working = true;
            this.dataSvc.update(id, data)
              .then((res) => {
                this.afterUpdate(res);
                this.working = false;
              });
          }
        }
      }
    }

    remove(): void {
      this.removeById(this.entry.id);
    }

    removeById(id: string): void {
      if (this.auth.isLoggedIn()) {
        // TODO replace this with an F4A modal
        if (confirm('Delete this entry?')) {
          this.working = true;
          this.dataSvc.remove(id)
            .then((res) => {
              if (!this.isListView()) {
                this.gotoListView();
              } else {
                this.find();
              }
              this.working = false;
            });
        }
      }
    }

    /*=============================================
     = CRUD helper methods
     =============================================*/
    protected clearEntry(): void {
      this.entry = this.dataSvc.getDefaultEntry();
      this.originalEntry = angular.copy(this.entry);
    }

    abstract canSaveUpdate(): boolean;

    getDataForUpdate(): any {
    }

    // do anything needed after a 'create()' call
    afterCreate(res: any): void {
      if (!this.isListView()) {
        this.gotoListView();
      } else {
        this.find();
      }
    }

    // do anything needed after a 'find()' call, e.g. list view
    afterFind(res: any): void {
      this.entries = angular.copy(res);
    }

    // do anything needed after a 'findOne()' call, e.g. detail/update views
    afterFindOne(res: any): void {
      this.entry = angular.copy(res);
      this.originalEntry = angular.copy(this.entry);
    }

    afterUpdate(res: any): void {
      this.gotoDetailView(res.id);
    }

    /*==============================================
     = navigation methods
     ==============================================*/
    refresh(): void {
      if (this.auth.isLoggedIn()) {
        this.entries = [];
        this.working = true;
        this.dataSvc.query(true)
          .then((res) => {
            this.afterFind(res);
          })
          .finally(() => {
            this.working = false;
          });
      }
    }

    refreshOne(): void {
      if (this.auth.isLoggedIn()) {
        this.clearEntry();
        this.working = true;
        this.dataSvc.get(this.$stateParams['id'], true)
          .then((res) => {
            this.afterFindOne(res);
          })
          .finally(() => {
            this.working = false;
          });
      }
    }

    /**
     * Called when a submit button is pressed.
     */
    submit(form: any): void {
      if (this.isUpdateView()) {
        this.update(form);
      } else if (this.isCreateView()) {
        this.create(form);
      }
    }

    /**
     * Called when a cancel button is pressed. Which state to return to
     * is determined by the current state.
     */
    cancel(): void {
      if (this.isUpdateView()) {
        this.gotoDetailView(this.$stateParams['id']);
      } else {
        this.gotoListView();
      }
    }

    /*==============================================
     = navigation methods
     ==============================================*/
    /**
     * Moves the current view to the module's 'list' view.
     */
    gotoListView(): void {
      this.$state.go(`home.${this.moduleName}-list`);
    }

    /**
     * Moves the current view to the module's 'detail' view.
     */
    gotoDetailView(id: string): void {
      this.$state.go(`home.${this.moduleName}-detail`, {id: id});
    }

    /**
     * Moves the current view to the module's 'create' view.
     */
    gotoCreateView(): void {
      this.$state.go(`home.${this.moduleName}-create`);
    }

    /**
     * Moves the current view to the module's 'update' view.
     */
    gotoUpdateView(id: string): void {
      this.$state.go(`home.${this.moduleName}-update`, {id: id});
    }

    /*==============================================
     = search methods
     ==============================================*/
    /**
     * Toggles whether the current view's search bar should be shown.
     */
    toggleShowSearch(): void {
      this.showSearch = !this.showSearch;
    }

    /*==============================================
     = globals
     ==============================================*/
    isDev(): boolean {
      return this.mainSvc.isDev();
    }
  }
}
