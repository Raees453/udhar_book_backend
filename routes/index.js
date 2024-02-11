// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth_routes');

// TODO add
router.use('/auth', authRoutes);

router.get('/', (req, res, next) =>
  res.status(200).json({
    success: true,
  }),
);

module.exports = router;
