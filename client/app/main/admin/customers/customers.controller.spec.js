'use strict';

describe('Component: CustomersComponent', function () {

  // load the controller's module
  beforeEach(module('app.customers'));

  var CustomersComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    CustomersComponent = $componentController('customers', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
