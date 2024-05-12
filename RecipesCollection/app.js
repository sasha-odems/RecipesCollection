require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const app = express();

const indexRoutes = require('./routes/index');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const seedDB = require("./seeds/seedDb");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'recipe collection secret',
  resave: false,
  saveUninitialized: false,
}));
app.use('/public', express.static('public'))
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

mongoose.connect(process.env.MONGO_URI,{authSource: 'admin',})
    .then(() => console.log('Connected to DB!'))
    .catch(error => console.log('Connection Failed!', error));

seedDB();

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRoutes);
app.use('/', recipeRoutes);
app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

