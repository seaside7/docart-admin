'use strict';

describe('Controller: CategoriesController', function () {

  // load the controller's module
  beforeEach(module('app.categories'));

  var CatalogsComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    CatalogsComponent = $componentController('CategoriesComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
