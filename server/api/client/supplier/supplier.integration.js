'use strict';

var app = require('../../..');
import request from 'supertest';

var newSupplier;

describe('Supplier API:', function() {
  describe('GET /api/v1/suppliers', function() {
    var suppliers;

    beforeEach(function(done) {
      request(app)
        .get('/api/v1/suppliers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          suppliers = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(suppliers).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/v1/suppliers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/v1/suppliers')
        .send({
          name: 'New Supplier',
          info: 'This is the brand new supplier!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newSupplier = res.body;
          done();
        });
    });

    it('should respond with the newly created supplier', function() {
      expect(newSupplier.name).to.equal('New Supplier');
      expect(newSupplier.info).to.equal('This is the brand new supplier!!!');
    });
  });

  describe('GET /api/v1/suppliers/:id', function() {
    var supplier;

    beforeEach(function(done) {
      request(app)
        .get(`/api/v1/suppliers/${newSupplier._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          supplier = res.body;
          done();
        });
    });

    afterEach(function() {
      supplier = {};
    });

    it('should respond with the requested supplier', function() {
      expect(supplier.name).to.equal('New Supplier');
      expect(supplier.info).to.equal('This is the brand new supplier!!!');
    });
  });

  describe('PUT /api/v1/suppliers/:id', function() {
    var updatedSupplier;

    beforeEach(function(done) {
      request(app)
        .put(`/api/v1/suppliers/${newSupplier._id}`)
        .send({
          name: 'Updated Supplier',
          info: 'This is the updated supplier!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedSupplier = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSupplier = {};
    });

    it('should respond with the original supplier', function() {
      expect(updatedSupplier.name).to.equal('New Supplier');
      expect(updatedSupplier.info).to.equal('This is the brand new supplier!!!');
    });

    it('should respond with the updated supplier on a subsequent GET', function(done) {
      request(app)
        .get(`/api/v1/suppliers/${newSupplier._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let supplier = res.body;

          expect(supplier.name).to.equal('Updated Supplier');
          expect(supplier.info).to.equal('This is the updated supplier!!!');

          done();
        });
    });
  });

  describe('PATCH /api/v1/suppliers/:id', function() {
    var patchedSupplier;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/v1/suppliers/${newSupplier._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Supplier' },
          { op: 'replace', path: '/info', value: 'This is the patched supplier!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedSupplier = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedSupplier = {};
    });

    it('should respond with the patched supplier', function() {
      expect(patchedSupplier.name).to.equal('Patched Supplier');
      expect(patchedSupplier.info).to.equal('This is the patched supplier!!!');
    });
  });

  describe('DELETE /api/v1/suppliers/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/v1/suppliers/${newSupplier._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when supplier does not exist', function(done) {
      request(app)
        .delete(`/api/v1/suppliers/${newSupplier._id}`)
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
