'use strict';

import crypto from 'crypto';
import mongoose from 'mongoose';
import {Schema} from 'mongoose';
import appRoot from 'app-root-path';
import path from 'path';

mongoose.Promise = require('bluebird');
var mongoosePaginate = require('mongoose-paginate');

import config from '../../../config/environment';
import s3 from './../../../components/s3bucket';

var UserMessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  created_at: { type: Date, default: Date.now }
})
.index({
    'title': 'text',
    'content': 'text'
});

UserMessageSchema.plugin(mongoosePaginate);

export default mongoose.model('UserMessage', UserMessageSchema);
