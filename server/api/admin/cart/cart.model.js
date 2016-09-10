'use strict';

import mongoose from 'mongoose';
import { Schema } from 'mongoose';

var CartSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        items: { type: Number, default: 0 }
    }]
});

export default mongoose.model('Cart', CartSchema);
