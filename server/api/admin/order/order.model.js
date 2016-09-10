'use strict';

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

/**
 * Module dependencies.
 */

var Schema = mongoose.Schema;

/**
 * Order Schema
 */
var OrderSchema = new Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  cart: [{
    product: { type: Schema.ObjectId, ref: 'Product' },
    items: { type: Number, default: 0 }
  }],
  address: {
    receiverName: String,
    phone: String,
    address1: String,
    address2: String,
    city: String,
    district: String, 
    state: String,
    zip: Number
  },
  logistic: { type: String },
  status: {
    type: String,
    enum: ['delivered', 'not delivered', 'cancelled', 'on process', 'paid'],
    default: 'on process'
  },
  created: { type: Date, default: Date.now }
});

OrderSchema.plugin(mongoosePaginate);

export default mongoose.model('Order', OrderSchema);
