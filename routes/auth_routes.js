const router = require('express').Router();

const authController = require('../controllers/auth_controller');

router.route('/signup').post(authController.signUp, authController.login);

router.route('/login').post(authController.login);

router.route('/forgot-password').post(authController.forgotPassword);

router.route('/reset-password').post(authController.resetPassword);

router.route('/update-password').post(authController.authorise, authController.updatePassword);

router.route('/delete').delete(authController.authorise, authController.login, authController.deleteAccount);

router.route('/update-account').patch(authController.authorise, authController.updateAccount);

module.exports = router;
