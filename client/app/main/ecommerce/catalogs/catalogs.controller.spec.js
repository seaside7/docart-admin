'use strict';

describe('Component: CatalogsComponent', function () {

  // load the controller's module
  beforeEach(module('app.catalogs'));

  var CatalogsComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    CatalogsComponent = $componentController('CatalogsComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
