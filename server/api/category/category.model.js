'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;
var slugs = require('mongoose-url-slugs');
var mongoosePaginate = require('mongoose-paginate');
var config = require('../../config/environment');

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

CategorySchema.plugin(slugs('name'));
CategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', CategorySchema);
