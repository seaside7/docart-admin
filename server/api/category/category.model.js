'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;
var slugs = require('mongoose-url-slugs');

var CategorySchema = new Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  ancestors: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  children: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
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

module.exports = mongoose.model('Category', CategorySchema);
