'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var customerCtrlStub = {
  index: 'customerCtrl.index',
  show: 'customerCtrl.show',
  create: 'customerCtrl.create',
  upsert: 'customerCtrl.upsert',
  patch: 'customerCtrl.patch',
  destroy: 'customerCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var customerIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './customer.controller': customerCtrlStub
});

describe('Customer API Router:', function() {
  it('should return an express router instance', function() {
    expect(customerIndex).to.equal(routerStub);
  });

  describe('GET /api/v1/customers', function() {
    it('should route to customer.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'customerCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/v1/customers/:id', function() {
    it('should route to customer.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'customerCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/v1/customers', function() {
    it('should route to customer.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'customerCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/v1/customers/:id', function() {
    it('should route to customer.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'customerCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/v1/customers/:id', function() {
    it('should route to customer.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'customerCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/v1/customers/:id', function() {
    it('should route to customer.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'customerCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
