const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favoriteRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.addToFavorites = async function(recipeId) {
  if (!this.favoriteRecipes.includes(recipeId)) {
    this.favoriteRecipes.push(recipeId);
    await this.save();
  }
};


userSchema.methods.removeFromFavorites = async function(recipeId) {
  this.favoriteRecipes = this.favoriteRecipes.filter(fav => fav.toString() !== recipeId.toString());
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
