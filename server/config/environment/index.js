'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  uploadsPath: './client/assets/uploads',

  // Server port
  port: process.env.PORT || 8080,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  useCsrf: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'suhendra-ahmad-kereeen'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  mailServer: {
    host: 'smtp.gmail.com',
    port: 443,
    username: 'info@do-cart.com',
    password: 'D0cart2016',  
  },

  adminMail: "info@do-cart.com",

  GmailApi: {
    user: 'info@do-cart.com',
    clientId: '1046017579432-ujfbc7utodcq110i3qsbv43tsh73gsf6.apps.googleusercontent.com',
    clientSecret: 'NShK1XtpAe8a3GdVpIM6l6r0',
    refreshToken: '1/ycny9eHPxTzG6r3OHDvTzfyWJvvu9LMFlHnlvAefs08',
    accessToken: 'ya29.Ci9TA36bhLXraX6HoVvpUtm2iS0MfeD6KdTBdYaHaseFaZ4aQz_j4lk0BDqme09gWQ'
                  //dXNlcj1pbmZvQGRvLWNhcnQuY29tAWF1dGg9QmVhcmVyIHlhMjkuQ2k5VEEtSGd6anU2MkFsM2ZHUkxMY0szTnlIVGNMUXlxckxiN0dZRDFhYUpaWktLZTZLbXRINnpQck1jZnNOODJ3AQE=

  },

  bankAccount: "BNI - 0111966992 a/n Suhendra Ahmad"
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});
