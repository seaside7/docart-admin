'use strict';


import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import appRoot from 'app-root-path';
import path from 'path';

import config from './../../../config/environment';
import s3 from './../../../components/s3bucket';

var ProductCommentSchema = new Schema({
    title: String,
    content: String,
    created_at: { type: Date, default: Date.now },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
}).index({
    'title': 'text',
    'content': 'text'
});


ProductCommentSchema.plugin(mongoosePaginate);

export default mongoose.model('ProductComment', ProductCommentSchema);