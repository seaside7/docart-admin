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

  imageHost: 'http://static.do-cart.com/images/',
  domain:  'http://admin.do-cart.com/',
  website: 'http://www.do-cart.com/',
  timeout: {
    client: 60 * 60 * 60,
    admin: 60 * 60 * 15
  }

};
