const express = require('express');

const authController = require('../controllers/auth_controller');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post(
  '/reset-password',
  authController.authorise,
  authController.resetPassword,
);

module.exports = router;
