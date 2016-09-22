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
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    products: [{
        product: { type: Schema.ObjectId, ref: 'Product' },
        count: { type: Number, default: 0, min: 0 },
        totalPrice: { type: Number, default: 0, min: 0 }
    }],
    subTotal: { type: Number, min: 0, default: 0 },
    logisticFee: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    courier: { type: String },
    address: {
        receiverName: String,
        phone: String,
        address1: String,
        address2: String,
        city: String,
        district: String,
        province: String,
        zip: Number
    },
    status: {
        type: String,
        enum: ['on process', 'transferred', 'paid', 'on delivery', 'received', 'cancelled'],
        default: 'on process'
    },
    messages: [{ type: String }],
    transferId: { type: String },
    created: { type: Date, default: Date.now }
});

OrderSchema.plugin(mongoosePaginate);

OrderSchema.statics.Status = () => {
    return {
        OnProcess: 'on process',
        Transferred: 'transferred',
        Paid: 'paid',
        OnDelivery: 'on delivery',
        Received: 'received',
        Cancelled: 'cancelled'
    }
}

export default mongoose.model('Order', OrderSchema);
