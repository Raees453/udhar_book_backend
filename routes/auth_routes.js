const router = require('express').Router();

const authController = require('../controllers/auth_controller');
const notificationController = require('../controllers/notifiication_controller');

router.route('/signup').post(authController.signUp, authController.login);

router.route('/login').post(authController.login);

router.route('/forgot-password').post(authController.forgotPassword);

router.route('/reset-password').post(authController.resetPassword);

router.route('/update-password').post(authController.authorise, authController.updatePassword);

router.route('/delete').delete(authController.authorise, authController.deleteAccount);

router.route('/update-account').patch(authController.authorise, authController.updateAccount);

router.route('/update-fcm-token').patch(authController.authorise, authController.updateFCMToken);

router.route('/send-notification').post(authController.authorise, notificationController.sendNotification);

module.exports = router;
