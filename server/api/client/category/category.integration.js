'use strict';

var app = require('../../..');
import request from 'supertest';

var newCategory;

describe('Category API:', function() {
  describe('GET /api/v1/categories', function() {
    var categorys;

    beforeEach(function(done) {
      request(app)
        .get('/api/v1/categories')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          categorys = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(categorys).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/v1/categories', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/v1/categories')
        .send({
          name: 'New Category',
          info: 'This is the brand new category!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCategory = res.body;
          done();
        });
    });

    it('should respond with the newly created category', function() {
      expect(newCategory.name).to.equal('New Category');
      expect(newCategory.info).to.equal('This is the brand new category!!!');
    });
  });

  describe('GET /api/v1/categories/:id', function() {
    var category;

    beforeEach(function(done) {
      request(app)
        .get(`/api/v1/categories/${newCategory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          category = res.body;
          done();
        });
    });

    afterEach(function() {
      category = {};
    });

    it('should respond with the requested category', function() {
      expect(category.name).to.equal('New Category');
      expect(category.info).to.equal('This is the brand new category!!!');
    });
  });

  describe('PUT /api/v1/categories/:id', function() {
    var updatedCategory;

    beforeEach(function(done) {
      request(app)
        .put(`/api/v1/categories/${newCategory._id}`)
        .send({
          name: 'Updated Category',
          info: 'This is the updated category!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCategory = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCategory = {};
    });

    it('should respond with the original category', function() {
      expect(updatedCategory.name).to.equal('New Category');
      expect(updatedCategory.info).to.equal('This is the brand new category!!!');
    });

    it('should respond with the updated category on a subsequent GET', function(done) {
      request(app)
        .get(`/api/v1/categories/${newCategory._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let category = res.body;

          expect(category.name).to.equal('Updated Category');
          expect(category.info).to.equal('This is the updated category!!!');

          done();
        });
    });
  });

  describe('PATCH /api/v1/categories/:id', function() {
    var patchedCategory;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/v1/categories/${newCategory._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Category' },
          { op: 'replace', path: '/info', value: 'This is the patched category!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCategory = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCategory = {};
    });

    it('should respond with the patched category', function() {
      expect(patchedCategory.name).to.equal('Patched Category');
      expect(patchedCategory.info).to.equal('This is the patched category!!!');
    });
  });

  describe('DELETE /api/v1/categories/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/v1/categories/${newCategory._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when category does not exist', function(done) {
      request(app)
        .delete(`/api/v1/categories/${newCategory._id}`)
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
