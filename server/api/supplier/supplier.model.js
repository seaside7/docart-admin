'use strict';

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

var SupplierSchema = new mongoose.Schema({
  logoUrl: String,
  address: String,
  phone: String,
  zip: String,
  city: String,
  country: String,
  description: String,
  active: Boolean,
});

SupplierSchema.plugin(mongoosePaginate);

export default mongoose.model('Supplier', SupplierSchema);
