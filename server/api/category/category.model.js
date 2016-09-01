'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;
var slugs = require('mongoose-url-slugs');
var mongoosePaginate = require('mongoose-paginate');
var config = require('../../config/environment');
import s3 from './../../components/s3bucket';
import appRoot from 'app-root-path';
import path from 'path';

var CategorySchema = new Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  ancestors: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  children: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  imageUrl: String
}).index({
    'name': 'text'
});

CategorySchema.methods = {
  addChild: function (child) {
    var that = this;
    child.parent = this._id;
    child.ancestors = this.ancestors.concat([this._id]);
    return this.model('Category').create(child, function (err, data) {
      that.children.push(data._id);
      that.save();
    });
  }
}


CategorySchema
    .post('find', function(doc) {
        doc.forEach((entity) => {
            if (entity.imageUrl) {
                entity.imageUrl = config.imageHost+path.basename(entity.imageUrl);
            }

            if (entity.supplier && entity.supplier.logoUrl) {
                entity.supplier.logoUrl = config.imageHost + path.basename(entity.supplier.logoUrl);
            }
        })
    });

CategorySchema
    .post('findOne', function(doc) {
        if (doc.imageUrl) {
              doc.imageUrl = config.imageHost+path.basename(doc.imageUrl);
          }

          if (doc.supplier && doc.supplier.logoUrl) {
              doc.supplier.logoUrl = config.imageHost + path.basename(doc.supplier.logoUrl);
          }
    });

CategorySchema
    .post('remove', function(doc) {
        var removedFiles = [];
        if (doc.imageUrl) {
            removedFiles.push(path.basename(doc.imageUrl));
        }

        if (doc.supplier && doc.supplier.logoUrl) {
            removedFiles.push(path.basename(doc.supplier.logoUrl));
        }
        
        if (removedFiles.length > 0) {
            s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, removedFiles, (err, data) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    });

CategorySchema.plugin(slugs('name'));
CategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', CategorySchema);
