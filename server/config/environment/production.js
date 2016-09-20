'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,

  // Server port
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,

  // MongoDB connection options
  mongo: {
    uri:  process.env.MONGODB_URI ||
          process.env.MONGOHQ_URL ||
          process.env.OPENSHIFT_MONGODB_DB_URL +
          process.env.OPENSHIFT_APP_NAME ||
          'mongodb://localhost/docart'
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
