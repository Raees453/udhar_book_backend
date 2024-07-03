const router = require('express').Router();

const authRoues = require('./auth_routes');
const contactsRoues = require('./contacts_routes');
const transactionRoutes = require('./transaction_routes');
const notificationRoutes = require('./notification_routes');

if (process.env.ENVIRONMENT === 'production') {
  router.route('/home').get((req, res) => res.status(200).json({
    status: 'success',
  }));
}

router.use('/auth', authRoues);

router.use('/contacts', contactsRoues);

router.use('/transactions', transactionRoutes);

router.use('/notifications', notificationRoutes);

module.exports = router;
