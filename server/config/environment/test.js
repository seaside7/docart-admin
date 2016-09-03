'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/docart-dev'
  },
  sequelize: {
    uri: 'sqlite://',
    options: {
      logging: false,
      storage: 'test.sqlite',
      define: {
        timestamps: false
      }
    }
  },
  s3: {
    Credentials: 'aws.credentials.json',
    Bucket: 'images'
  },

  imageHost: 'http://128.199.251.64:9000/images/',
  domain:  'http://do-cart.com:8080/'

};
