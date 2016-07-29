'use strict';

var app = require('../..');
import request from 'supertest';

var newSupplier;

describe('Supplier API:', function() {

  describe('GET /api/suppliers', function() {
    var suppliers;

    beforeEach(function(done) {
      request(app)
        .get('/api/suppliers')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
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

  describe('POST /api/suppliers', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/suppliers')
        .send({
          name: 'New Supplier',
          info: 'This is the brand new supplier!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
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

  describe('GET /api/suppliers/:id', function() {
    var supplier;

    beforeEach(function(done) {
      request(app)
        .get('/api/suppliers/' + newSupplier._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
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

  describe('PUT /api/suppliers/:id', function() {
    var updatedSupplier;

    beforeEach(function(done) {
      request(app)
        .put('/api/suppliers/' + newSupplier._id)
        .send({
          name: 'Updated Supplier',
          info: 'This is the updated supplier!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSupplier = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSupplier = {};
    });

    it('should respond with the updated supplier', function() {
      expect(updatedSupplier.name).to.equal('Updated Supplier');
      expect(updatedSupplier.info).to.equal('This is the updated supplier!!!');
    });

  });

  describe('DELETE /api/suppliers/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/suppliers/' + newSupplier._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when supplier does not exist', function(done) {
      request(app)
        .delete('/api/suppliers/' + newSupplier._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
