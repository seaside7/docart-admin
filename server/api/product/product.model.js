'use strict';


import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import {
    Schema
} from 'mongoose';

var ProductSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
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
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }],
    tags: String
}).index({
    'title': 'text',
    'description': 'text',
    'tags': 'text'
});

export default mongoose.model('Product', ProductSchema);