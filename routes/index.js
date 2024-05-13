const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/recipes');
});

module.exports = router;
