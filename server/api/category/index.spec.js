'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var categoryCtrlStub = {
  index: 'categoryCtrl.index',
  show: 'categoryCtrl.show',
  create: 'categoryCtrl.create',
  update: 'categoryCtrl.update',
  destroy: 'categoryCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var categoryIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './category.controller': categoryCtrlStub
});

describe('Category API Router:', function() {

  it('should return an express router instance', function() {
    expect(categoryIndex).to.equal(routerStub);
  });

  describe('GET /api/categories', function() {

    it('should route to category.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'categoryCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/categories/:id', function() {

    it('should route to category.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'categoryCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/categories', function() {

    it('should route to category.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'categoryCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/categories/:id', function() {

    it('should route to category.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'categoryCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/categories/:id', function() {

    it('should route to category.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'categoryCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/categories/:id', function() {

    it('should route to category.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'categoryCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
