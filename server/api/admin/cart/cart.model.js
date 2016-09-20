'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var CartSchema = new mongoose.Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'User' },
    supplier: { type: Schema.Types.ObjectId, ref: 'User' },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        count: { type: Number, min: 0, default: 0 },
        totalPrice: { type: Number, min: 0, default: 0 },
    }],
    subTotal: { type: Number, min: 0, default: 0 },
    logistic: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    courier: { type: String }
});

export default mongoose.model('Cart', CartSchema);
