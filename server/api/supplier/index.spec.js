'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var supplierCtrlStub = {
  index: 'supplierCtrl.index',
  show: 'supplierCtrl.show',
  create: 'supplierCtrl.create',
  update: 'supplierCtrl.update',
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
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './supplier.controller': supplierCtrlStub
});

describe('Supplier API Router:', function() {

  it('should return an express router instance', function() {
    expect(supplierIndex).to.equal(routerStub);
  });

  describe('GET /api/suppliers', function() {

    it('should route to supplier.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'supplierCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/suppliers/:id', function() {

    it('should route to supplier.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'supplierCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/suppliers', function() {

    it('should route to supplier.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'supplierCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/suppliers/:id', function() {

    it('should route to supplier.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'supplierCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/suppliers/:id', function() {

    it('should route to supplier.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'supplierCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/suppliers/:id', function() {

    it('should route to supplier.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'supplierCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
