'use strict';

const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  title: { type: String, required: true },
  instructions: { type: String },
  ingredients: [
    { name: String,
    unit: String,
  quantity: Number}
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }
});


// recipeSchema.virtual('authorName').get(function () {
//   return `${this.author.firstName} ${this.author.lastName}`.trim();
// });

// recipeSchema.methods.serialize = function () {
//   return {
//     id: this._id,
//     author: this.authorName,
//     content: this.content,
//     title: this.title,
//     created: this.created
//   };
// };

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = { Recipe };
