'use strict';

var app = require('../..');
import request from 'supertest';

var newCart;

describe('Cart API:', function() {
  describe('GET /api/carts', function() {
    var carts;

    beforeEach(function(done) {
      request(app)
        .get('/api/carts')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          carts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(carts).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/carts', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/carts')
        .send({
          name: 'New Cart',
          info: 'This is the brand new cart!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCart = res.body;
          done();
        });
    });

    it('should respond with the newly created cart', function() {
      expect(newCart.name).to.equal('New Cart');
      expect(newCart.info).to.equal('This is the brand new cart!!!');
    });
  });

  describe('GET /api/carts/:id', function() {
    var cart;

    beforeEach(function(done) {
      request(app)
        .get(`/api/carts/${newCart._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          cart = res.body;
          done();
        });
    });

    afterEach(function() {
      cart = {};
    });

    it('should respond with the requested cart', function() {
      expect(cart.name).to.equal('New Cart');
      expect(cart.info).to.equal('This is the brand new cart!!!');
    });
  });

  describe('PUT /api/carts/:id', function() {
    var updatedCart;

    beforeEach(function(done) {
      request(app)
        .put(`/api/carts/${newCart._id}`)
        .send({
          name: 'Updated Cart',
          info: 'This is the updated cart!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCart = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCart = {};
    });

    it('should respond with the original cart', function() {
      expect(updatedCart.name).to.equal('New Cart');
      expect(updatedCart.info).to.equal('This is the brand new cart!!!');
    });

    it('should respond with the updated cart on a subsequent GET', function(done) {
      request(app)
        .get(`/api/carts/${newCart._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let cart = res.body;

          expect(cart.name).to.equal('Updated Cart');
          expect(cart.info).to.equal('This is the updated cart!!!');

          done();
        });
    });
  });

  describe('PATCH /api/carts/:id', function() {
    var patchedCart;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/carts/${newCart._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Cart' },
          { op: 'replace', path: '/info', value: 'This is the patched cart!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCart = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCart = {};
    });

    it('should respond with the patched cart', function() {
      expect(patchedCart.name).to.equal('Patched Cart');
      expect(patchedCart.info).to.equal('This is the patched cart!!!');
    });
  });

  describe('DELETE /api/carts/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/carts/${newCart._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when cart does not exist', function(done) {
      request(app)
        .delete(`/api/carts/${newCart._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
