const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true }
});

const ratingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  value: { type: Number, required: true }
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});


const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [ingredientSchema],
  instructions: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  photo: String,
  ratings: [ratingSchema],
  comments: [commentSchema]
});

module.exports = mongoose.model('Recipe', recipeSchema);
