const router = require('express').Router();

const notificationController = require('../controllers/notifiication_controller');
const authController = require('../controllers/auth_controller');

router.use(authController.authorise);

router.route('/').get(notificationController.getNotifiications).delete(notificationController.deleteNotification);

router.route('/mark').post(notificationController.markNotificationAsRead);

module.exports = router;
