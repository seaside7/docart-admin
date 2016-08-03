'use strict';

var app = require('../..');
import request from 'supertest';

var newDashboard;

describe('Dashboard API:', function() {

  describe('GET /api/dashboards', function() {
    var dashboards;

    beforeEach(function(done) {
      request(app)
        .get('/api/dashboards')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          dashboards = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(dashboards).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/dashboards', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/dashboards')
        .send({
          name: 'New Dashboard',
          info: 'This is the brand new dashboard!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newDashboard = res.body;
          done();
        });
    });

    it('should respond with the newly created dashboard', function() {
      expect(newDashboard.name).to.equal('New Dashboard');
      expect(newDashboard.info).to.equal('This is the brand new dashboard!!!');
    });

  });

  describe('GET /api/dashboards/:id', function() {
    var dashboard;

    beforeEach(function(done) {
      request(app)
        .get('/api/dashboards/' + newDashboard._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          dashboard = res.body;
          done();
        });
    });

    afterEach(function() {
      dashboard = {};
    });

    it('should respond with the requested dashboard', function() {
      expect(dashboard.name).to.equal('New Dashboard');
      expect(dashboard.info).to.equal('This is the brand new dashboard!!!');
    });

  });

  describe('PUT /api/dashboards/:id', function() {
    var updatedDashboard;

    beforeEach(function(done) {
      request(app)
        .put('/api/dashboards/' + newDashboard._id)
        .send({
          name: 'Updated Dashboard',
          info: 'This is the updated dashboard!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedDashboard = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedDashboard = {};
    });

    it('should respond with the updated dashboard', function() {
      expect(updatedDashboard.name).to.equal('Updated Dashboard');
      expect(updatedDashboard.info).to.equal('This is the updated dashboard!!!');
    });

  });

  describe('DELETE /api/dashboards/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/dashboards/' + newDashboard._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when dashboard does not exist', function(done) {
      request(app)
        .delete('/api/dashboards/' + newDashboard._id)
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
