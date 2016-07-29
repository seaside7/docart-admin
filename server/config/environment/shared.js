'use strict';

exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'customer', 'supplier', 'user', 'admin'],
  getUploadPath: function(file) {
    return '/assets/uploads/' + file;
  },
  getRelativeUploadPath: function(file) {
    return './client/assets/uploads/' + file;
  }
};
