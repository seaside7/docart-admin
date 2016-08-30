'use strict';

exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'customer', 'supplier', 'user', 'admin'],
  productUnits: ['Gram', 'Ons', 'Pon', 'Kilogram', 'Pcs', 'Lusin', 'Kodi', 'Boks', 'Karton'],
  getUploadPath: function(file) {
    return '/assets/uploads/' + file;
  },
  getRelativeUploadPath: function(file) {
    return './client/assets/uploads/' + file;
  }
};
