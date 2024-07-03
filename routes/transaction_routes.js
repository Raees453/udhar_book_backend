const express = require('express');

const authController = require('../controllers/auth_controller');
const transactionController = require('../controllers/transaction_controller');
const contactsController = require('../controllers/contacts_controller');
const notificationController = require('../controllers/notifiication_controller');

const router = express.Router();

router.use(authController.authorise);

router
  .route('/')
  .get(contactsController.getContactById)
  .post(
    contactsController.getContactById,
    transactionController.createTransaction,
    notificationController.sendNotification,
  )
  .patch(transactionController.updateTransaction, notificationController.sendNotification)
  .delete(transactionController.deleteTransaction, notificationController.sendNotification);

router.use(transactionController.getTransactions);

module.exports = router;
