const Recipe = require('../models/recipe');
const User = require('../models/user');
const path = require('path');
const multer = require('multer');
const {log} = require("debug");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author');
    res.render('recipes', { recipes });
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

exports.addRecipe = async (req, res) => {
  upload.single('photo')(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    try {
      const { name, instructions } = req.body;
      let ingredients = req.body.ingredients.map((ingredient, index) => ({
        name: ingredient,
        amount: req.body.amounts[index]
      }));

      const newRecipe = new Recipe({
        name,
        ingredients,
        instructions,
        author: req.user._id,
        photo: req.file ? req.file.path : ''
      });

      await newRecipe.save();
      res.redirect('/recipes');
    } catch (error) {
      res.status(500).send(error.toString());
    }
  });
};

exports.getRecipeForm = (req, res) => {
  res.render('addRecipe');
};

exports.toggleFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isFavorite = user.favoriteRecipes.some(fav => fav.toString() === recipeId);

    if (isFavorite) {
      // Remove from favorites
      user.favoriteRecipes = user.favoriteRecipes.filter(fav => fav.toString() !== recipeId);
    } else {
      // Add to favorites
      user.favoriteRecipes.push(recipeId);
    }

    await user.save();
    res.json({ success: true, isFavorite: !isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ success: false, message: 'Error toggling favorite' });
  }
};

exports.rateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;
    let { value } = req.body;

    // Convert value to a number if it's not already
    value = Number(value);

    // Check if the value is a number and within the allowed range
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ success: false, message: 'Rating value must be a number between 1 and 5.' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Check if the user has already rated this recipe
    const existingRatingIndex = recipe.ratings.findIndex(r => r.user.toString() === userId.toString());

    if (existingRatingIndex !== -1) {
      // Update existing rating
      recipe.ratings[existingRatingIndex].value = value;
    } else {
      // Add new rating
      recipe.ratings.push({ user: userId, value });
    }

    await recipe.save();
    res.json({ success: true, message: 'Rating updated successfully' });
  } catch (error) {
    console.error('Error rating recipe:', error);
    res.status(500).json({ success: false, message: 'Error rating recipe' });
  }
};

exports.showRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author')
      .populate('comments.author')
      .populate({
        path: 'ratings.user',
        model: 'User'
      });

    if (!recipe) {
      return res.status(404).render('error', { message: 'Recipe not found' });
    }

    // Find the user's rating if it exists
    if (!req.user) {
      return res.render('recipeDetail', { recipe });
    }
    const userRating = recipe.ratings.find(rating => rating.user._id.toString() === req.user._id.toString());

    res.render('recipeDetail', {
      recipe,
      currentUser: req.user,
      userRating: userRating ? userRating.value : null  // Pass the user's rating to the view
    });
  } catch (error) {
    console.error('Failed to fetch recipe:', error);
    res.status(500).render('error', { message: 'Error fetching recipe details' });
  }
};;

exports.addComment = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const comment = {
      text,
      author: userId,
      createdAt: new Date()
    };

    recipe.comments.push(comment);
    await recipe.save();

    res.redirect('/recipes/' + recipeId);
  } catch (error) {
    console.error('Failed to add comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};
exports.showFavoriteRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favoriteRecipes',
      model: 'Recipe',
      populate: {
        path: 'author',
        model: 'User'
      }
    });

    if (!user) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: { status: 404, stack: 'No additional error stack available.' }
      });
    }

    res.render('favoriteRecipes', {
      currentUser: req.user,
      favoriteRecipes: user.favoriteRecipes
    });
  } catch (error) {
    console.error('Failed to fetch favorite recipes:', error);
    res.status(500).render('error', {
      message: 'Error fetching favorite recipes',
      error: error || { status: 500, stack: 'No stack trace available' }
    });
  }
};

exports.editRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).render('error', {
        message: 'Recipe not found',
        error: { status: 404, stack: 'Recipe not found' }
      });
    }

    // Ensure that the user editing the recipe is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', {
        message: 'Unauthorized',
        error: { status: 403, stack: 'You do not have permission to edit this recipe' }
      });
    }

    res.render('editRecipe', { recipe });
  } catch (error) {
    console.error('Failed to fetch recipe for editing:', error);
    res.status(500).render('error', {
      message: 'Error fetching recipe for editing',
      error: error || { status: 500, stack: 'No stack trace available' }
    });
  }
};

exports.updateRecipe = async (req, res) => {
  upload.single('photo')(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }


  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    // Ensure that the user updating the recipe is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    recipe.name = req.body.name;
    recipe.ingredients = Object.keys(req.body.ingredients).map(key => ({
      name: req.body.ingredients[key].name,
      amount: req.body.ingredients[key].amount
    }));
    recipe.instructions = req.body.instructions;

    if (req.file) {
      recipe.photo = req.file ? req.file.path : ''
    }

    await recipe.save();
    res.redirect('/recipes/' + recipe._id);
  } catch (error) {
    console.error('Failed to update recipe:', error);
    res.status(500).json({ success: false, message: 'Failed to update recipe' });
  }
  });
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    // Check if the recipe exists
    if (!recipe) {
      return res.status(404).render('error', {
        message: 'Recipe not found',
        error: { status: 404, stack: 'No additional error stack available.' }
      });
    }

    // Ensure that the user deleting the recipe is the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      return res.status(403).render('error', {
        message: 'Unauthorized',
        error: { status: 403, stack: 'You do not have permission to delete this recipe' }
      });
    }

    // Use findByIdAndDelete to remove the recipe
    await Recipe.findByIdAndDelete(req.params.id);

    res.redirect('/recipes');
  } catch (error) {
    console.error('Failed to delete recipe:', error);
    res.status(500).render('error', {
      message: 'Failed to delete recipe',
      error: error || { status: 500, stack: 'No stack trace available' }
    });
  }
};
;
