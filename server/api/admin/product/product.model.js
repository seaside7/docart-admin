'use strict';


import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import appRoot from 'app-root-path';
import path from 'path';

import config from './../../../config/environment';
import s3 from './../../../components/s3bucket';

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
    prices: [{
        minOrder: { type: Number, min: 0, default: 0 },
        price: { type: Number, min: 0, default: 0 }
    }],
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
    imageUrl: String,
    imageUrls: [{type: String}],
    featured: Boolean,
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    unit: { type: String, default: '' },
    rank: { type: Number, min: 0, default: 0 },
    minOrder: { type: Number, min: 0, default: 0 },
    width: { type: String, default: '' },
    height: { type: String, default: '' },
    depth: { type: String, default: '' },
    weight: { type: String, default: '' } 
}).index({
    'title': 'text',
    'description': 'text',
    'tags': ['text']
});

ProductSchema
    .post('find', function(doc) {
        doc.forEach((entity) => {
            if (entity.imageUrl) {
                entity.imageUrl = config.imageHost+path.basename(entity.imageUrl);
            }

            if (entity.imageUrls) {
                for (var i=0; i < entity.imageUrls.length; i++) {
                    entity.imageUrls[i] = config.imageHost + path.basename(entity.imageUrls[i]);
                }
            }
        })
    });

ProductSchema
    .post('findOne', function(doc) {
        if (doc && doc.imageUrl) {
            doc.imageUrl = config.imageHost+path.basename(doc.imageUrl);
        }

        if (doc && doc.imageUrls) {
            for (var i=0; i < doc.imageUrls.length; i++) {
                doc.imageUrls[i] = config.imageHost + path.basename(doc.imageUrls[i]);
            }
        }
    });

ProductSchema
    .post('remove', function(doc) {
        var removedFiles = [];
        if (doc && doc.imageUrl) {
            removedFiles.push(path.basename(doc.imageUrl));
        }

        if (doc && doc.imageUrls) {
            doc.imageUrls.forEach((img) => {
                removedFiles.push(path.basename(img));
            })
        }

        if (removedFiles.length > 0) {
            s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, removedFiles, (err, data) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    })

ProductSchema.plugin(mongoosePaginate);

export default mongoose.model('Product', ProductSchema);