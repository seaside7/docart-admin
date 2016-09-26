'use strict';

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import appRoot from 'app-root-path';
import path from 'path';

import config from './../../../config/environment';
import s3 from './../../../components/s3bucket';

var SupplierSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  logoUrl: String,
  address: String,
  phone: String,
  zip: String,
  city: String,
  province: String,
  country: String,
  description: String,
  premium: { type: Boolean, default: false },
  rank: { type: Number, min: 0, default: 0 },
  bankName: String,
  bankCode: String,
  bankAccount: String,
  logistics: [{  
    courier: { type: String, default: '' },
    shippingTime: { type: Number, default: 1, min: 1 },
    sendTime: { type: String, default: '' },
    cost: { type: Number, default: 0, min: 0 }
  }]
});

SupplierSchema
  .post('remove', function (doc) {
    var removedFiles = [];
    if (doc && doc.logoUrl) {
      removedFiles.push(path.basename(doc.logoUrl));
    }

    if (removedFiles.length > 0) {
      s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, removedFiles, (err, data) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });

SupplierSchema
  .post('find', function (doc) {
    doc.forEach((entity) => {
      if (entity.logoUrl) {
        entity.logoUrl = config.imageHost + path.basename(entity.logoUrl);
      }
    })
  });

SupplierSchema
  .post('findOne', function (doc) {
    if (doc && doc.logoUrl) {
      doc.logoUrl = config.imageHost + path.basename(doc.logoUrl);
    }
  });

SupplierSchema.plugin(mongoosePaginate);

export default mongoose.model('Supplier', SupplierSchema);
