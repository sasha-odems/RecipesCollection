const express = require('express');
const router = express.Router();
const recipesController = require('../controllers/recipesController');

router.get('/recipes', recipesController.getAllRecipes);
router.get('/recipes/add', recipesController.getRecipeForm);
router.post('/recipes/add', recipesController.addRecipe);
router.get('/recipes/favorites', recipesController.showFavoriteRecipes);
router.post('/recipes/:id/delete',recipesController.deleteRecipe);
router.get('/recipes/:id/edit', recipesController.editRecipe);
router.post('/recipes/:id/update', recipesController.updateRecipe);
router.post("/recipes/:id/toggle-favorite", recipesController.toggleFavorite);
router.post('/recipes/:id/rate', recipesController.rateRecipe);
router.get('/recipes/:id', recipesController.showRecipe);
router.post('/recipes/:id/comments', recipesController.addComment);

module.exports = router;
