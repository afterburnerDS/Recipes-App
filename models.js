'use strict';

const mongoose = require('mongoose');

const ingSchema = mongoose.Schema(
  {name: String,
  thumb: String,
quantity: Number,
unit: String },
{ _id : false});

const recipeSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: {type: String},
  instructions: { type: String },
  ingredients: [ingSchema],
  tags : [
    { type: String}
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User'
  },
  created: { type: Date, default: Date.now }
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
