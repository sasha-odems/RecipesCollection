const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('register', {
      errors: errors.array()
    });
  }

  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};
