/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import User from '../api/user/user.model';
import Category from '../api/category/category.model';
import Product from '../api/product/product.model';

var ayam, daging;

Category.find({}).remove()
  .then(function () {
    return Category.create({ name: 'Ayam' })
  })
  .then(function (category) {
    ayam = category;
    return ayam.addChild({ name: 'Ayam Goreng' });
  })
  .then(function (category) {
    return ayam.addChild({ name: 'Daging Ayam 800 gram' });
  })
  .then(function (category) {
    return ayam.addChild({ name: 'Daging Ayam 1 Kg' });
  })
  .then(function (category) {
    return ayam.addChild({ name: 'Daging Ayam 1.5 Kg' });
  })
  .then(function (category) {
    return Category.create({ name: 'Udang' });
  })
  .then(function (category) {
    return Category.create({ name: 'Daging' });
  })
  .then(function (category) {
    daging = category;
    return daging.addChild({ name: 'Daging Ikan' });
  })
  .then(function (category) {
    return daging.addChild({ name: 'Daging Sapi' });
  })
  .then(function (category) {
    return daging.addChild({ name: 'Daging Udang' });
  })
  .then(function (category) {
    return Category.create({ name: 'Seafood' });
  })
  .then(function (category) {
    return Category.create({ name: 'Ikan' });
  })
  .then(function (category) {
    return Category.create({ name: 'Pisang' });
  })
  .then(function (category) {
    return Category.create({ name: 'Bumbu' });
  })
  .then(function (category) {
    return Category.create({ name: 'Sayuran' });
  })
  .then(function (category) {
    return Category.create({ name: 'Minyak' });
  })
  .then(function (category) {
    return Category.create({ name: 'Susu' });
  })
  .then(function (category) {
    return Category.create({ name: 'Keju' });
  })
  .then(function (category) {
    return Category.create({ name: 'Tepung' });
  })
  .then(function (category) {
    return Product.find({}).remove({});
  })
  .then(function () {
    return Product.create({
      title: 'Ayam Broiler',
      imageUrl: '/assets/images/yeoman.png',
      price: 25,
      stock: 250,
      categories: [ayam],
      description: 'Telor Ayam Kampung'
    },
      {
        title: 'Daging Sapi',
        description: 'Daging Saping Murah',
        price: 100,
        stock: 20,
        categories: [daging],
        imageUrl: '/assets/uploads/kaos.jpg'
      });
  })
  .then(function () {
    console.log('Finished populating Products with categories');
  })
  .then(null, function (err) {
    console.error('Error populating Products & categories: ', err);
  })

User.find({}).remove()
  .then(() => {
    User.create({
      provider: 'local',
      name: 'Test User',
      email: 'test@docart.com',
      password: 'test123'
    }, {
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'admin@docart.com',
        password: 'admin123'
      })
      .then(() => {
        console.log('finished populating users');
      });
  });

