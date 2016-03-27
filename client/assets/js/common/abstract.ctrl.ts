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
                protected moduleName: string) {
      this.working = true;
      this.showSearch = false;

      // listen for view enter events
      $scope.$on('$ionicView.beforeEnter', (e) => {
        if (this.auth.isLoggedIn()) {
          this.onBeforeEnterView();
        }
      });
    }

    /*=============================================
     = view state-checking methods
     =============================================*/

    isListView(): boolean {
      return this.$state.is(`app.${this.moduleName}-list`);
    }

    isDetailView(): boolean {
      return this.$state.is(`app.${this.moduleName}-detail`);
    }

    isUpdateView(): boolean {
      return this.$state.is(`app.${this.moduleName}-update`);
    }

    isCreateView(): boolean {
      return this.$state.is(`app.${this.moduleName}-create`);
    }

    /*=============================================
     = ionic view callbacks
     =============================================*/
    private onBeforeEnterView(): void {
      if (this.isListView()) {
        this.initListView();
      } else if (this.isDetailView()) {
        this.initDetailView();
      } else if (this.isUpdateView()) {
        this.initUpdateView();
      } else if (this.isCreateView()) {
        this.initCreateView();
      }
    }

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
    create(form): void {
      if (this.auth.isLoggedIn()) {
        form.$submitted = true;
        if (form.$valid) {
          this.working = true;
          this.dataSvc.save(this.entry)
            .then((res) => {
              this.gotoListView();
              this.working = false;
            });
        }
      }
    };

    find(forceRefresh: boolean = false): void {
      if (this.auth.isLoggedIn()) {
        this.entries = [];
        this.working = true;
        this.dataSvc.query(forceRefresh)
          .then((res) => {
            this.afterFind(res);
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

    update(form): void {
      if (this.auth.isLoggedIn()) {
        form.$submitted = true;

        if (form.$valid) {
          if (this.canSaveUpdate()) {
            const data: any = this.getDataForUpdate();
            const id: string = this.entry.id;
            this.working = true;
            this.dataSvc.update(id, data)
              .then((res) => {
                this.gotoDetailView(res.id);
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
        // TODO replace this with an F4A model
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

    abstract getDataForUpdate(): any;

    // do anything needed after a 'find()' call, e.g. list view
    afterFind(res: any): void {
      this.entries = angular.copy(res);
    }

    // do anything needed after a 'findOne()' call, e.g. detail/update views
    afterFindOne(res: any): void {
      this.entry = angular.copy(res);
      this.originalEntry = angular.copy(this.entry);
    }

    /*==============================================
     = navigation methods
     ==============================================*/
    /**
     * Called when the 'pull-to-refresh' feature is used. By default, it
     * simply reloads the list view.
     */
    refresh(): void {
      if (this.auth.isLoggedIn()) {
        this.entries = [];
        this.working = true;
        this.dataSvc.query(true)
          .then((res) => {
            this.afterFind(res);
            this.working = false;
          })
          .finally(() => {
            this.$scope.$broadcast('scroll.refreshComplete');
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
            this.working = false;
          })
          .finally(() => {
            this.$scope.$broadcast('scroll.refreshComplete');
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

    /**
     * Moves the current view to the module's 'list' view.
     */
    gotoListView(): void {
      this.$state.go(`app.${this.moduleName}-list`);
    }

    /**
     * Moves the current view to the module's 'detail' view.
     */
    gotoDetailView(id: string): void {
      this.$state.go(`app.${this.moduleName}-detail`, {id: id});
    }

    /**
     * Toggles whether the current view's search bar should be shown.
     */
    toggleShowSearch(): void {
      this.showSearch = !this.showSearch;
    }
  }
}
