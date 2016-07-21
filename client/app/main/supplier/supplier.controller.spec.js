'use strict';

describe('Component: SupplierComponent', function () {

  // load the controller's module
  beforeEach(module('app.supplier'));

  var SupplierComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    SupplierComponent = $componentController('SupplierComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
