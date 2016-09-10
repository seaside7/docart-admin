'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var supplierCtrlStub = {
  index: 'supplierCtrl.index',
  show: 'supplierCtrl.show',
  create: 'supplierCtrl.create',
  upsert: 'supplierCtrl.upsert',
  patch: 'supplierCtrl.patch',
  destroy: 'supplierCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var supplierIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './supplier.controller': supplierCtrlStub
});

describe('Supplier API Router:', function() {
  it('should return an express router instance', function() {
    expect(supplierIndex).to.equal(routerStub);
  });

  describe('GET /api/v1/suppliers', function() {
    it('should route to supplier.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'supplierCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/v1/suppliers/:id', function() {
    it('should route to supplier.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'supplierCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/v1/suppliers', function() {
    it('should route to supplier.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'supplierCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/v1/suppliers/:id', function() {
    it('should route to supplier.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'supplierCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/v1/suppliers/:id', function() {
    it('should route to supplier.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'supplierCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/v1/suppliers/:id', function() {
    it('should route to supplier.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'supplierCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
