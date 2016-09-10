'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var categoryCtrlStub = {
  index: 'categoryCtrl.index',
  show: 'categoryCtrl.show',
  create: 'categoryCtrl.create',
  upsert: 'categoryCtrl.upsert',
  patch: 'categoryCtrl.patch',
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
  express: {
    Router() {
      return routerStub;
    }
  },
  './category.controller': categoryCtrlStub
});

describe('Category API Router:', function() {
  it('should return an express router instance', function() {
    expect(categoryIndex).to.equal(routerStub);
  });

  describe('GET /api/v1/categories', function() {
    it('should route to category.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'categoryCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/v1/categories/:id', function() {
    it('should route to category.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'categoryCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/v1/categories', function() {
    it('should route to category.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'categoryCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/v1/categories/:id', function() {
    it('should route to category.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'categoryCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/v1/categories/:id', function() {
    it('should route to category.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'categoryCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/v1/categories/:id', function() {
    it('should route to category.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'categoryCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
