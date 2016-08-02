'use strict';


import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {
    Schema
} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

var ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    finalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    discount: {
        type: Number,
        min: 0,
        default: 0
    },
    description: String,
    published_at: {
        type: Date,
        default: Date.now
    },
    published: Boolean,
    imageBin: {
        data: Buffer,
        contentType: String
    },
    imageUrl: String,
    featured: Boolean,
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String]
}).index({
    'title': 'text',
    'description': 'text',
    'tags': ['text']
});

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', ProductSchema);