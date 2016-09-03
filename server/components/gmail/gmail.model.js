'use strict';

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import config from '../../config/environment';
import s3 from './../../components/s3bucket';
import appRoot from 'app-root-path';
import path from 'path';

var GmailSchema = new mongoose.Schema({
  user: { type: String, unique: true },
  accessToken: String,
  refreshToken: String,
  timeout: String
});

export default mongoose.model('Gmail', GmailSchema);
