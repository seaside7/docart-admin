'use strict';

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

var SupplierSchema = new mongoose.Schema({
  logo: String,
  description: String,
  active: Boolean,
  phone: String,
  address: String,
  zip: String,
  city: String,
  country: String
});

SupplierSchema.plugin(mongoosePaginate);

export default mongoose.model('Supplier', SupplierSchema);
