'use strict';

const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  title: { type: String, required: true },
  instructions: { type: String },
  ingredients: [
    { name: String,
  quantity: Number,
  unit: String,}
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  }
});


// recipeSchema.virtual('authorName').get(function () {
//   return `${this.author.firstName} ${this.author.lastName}`.trim();
// });

recipeSchema.methods.serialize = function () {
  return {
    id: this._id,
    title: this.title,
    instructions: this.instructions,
   
  };
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = { Recipe };
