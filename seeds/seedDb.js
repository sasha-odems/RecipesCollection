const User = require('../models/user'); // Path to your User model
const Recipe = require('../models/recipe'); // Path to your Recipe model
const users = require('./userSeedData'); // Path to the test data for users
const comments = require('./commentSeedData'); // Path to the test data for comments
const ratings = require('./ratingSeedData'); // Path to the test data for ratings
const recipes = require('./recipeSeedData'); // Path to the test data for recipes

async function seedDB() {
    try {
        const usersExist = await User.countDocuments();
        const recipesExist = await Recipe.countDocuments();

        if (usersExist === 0 && recipesExist === 0) {
            let createdUsers = []
            // Create users
            for (const user of users) {
                let newUser = new User(user);
                createdUsers.push(newUser);
                await newUser.save();
            }
            console.log('Users seeded!');

            // Create comments and link them to users
            for (const recipe of recipes) {
                recipe.author = createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
                recipe.comments = comments.map(comment => {
                    comment.author = createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
                    return comment;
                });
                recipe.ratings = ratings.map(rating => {
                    rating.user = createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
                    return rating;
                });
                let newRecipe = new Recipe(recipe);
                await newRecipe.save();
            }
            console.log('Recipes seeded!');
        } else {
            console.log('Database already has records, skipping seeding.');
        }
    } catch (error) {
        console.log('Error seeding database:', error);
    }
}

module.exports = seedDB;