'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/docart-dev'
  },

  // Seed database on startup
  seedDB: false,

  s3: {
    Credentials: 'aws.credentials.json',
    Bucket: 'images'
  },

  imageHost: 'http://128.199.251.64:9000/images/',

  domain:  'http://localhost:8080/'

};
