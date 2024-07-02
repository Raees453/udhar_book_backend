const express = require('express');

const authController = require('../controllers/auth_controller');
const transactionController = require('../controllers/transaction_controller');
const contactsController = require('../controllers/contacts_controller');
const notificationsController = require('../controllers/notifiication_controller');

const router = express.Router();

router.use(authController.authorise);

router
  .route('/')
  .get(contactsController.getContactById, transactionController.getTransactions)
  .post(
    contactsController.getContactById,
    transactionController.createTransaction,
    notificationsController.addNotification,
    transactionController.getTransactions,
  )
  .patch(
    transactionController.updateTransaction,
    transactionController.getTransactions,
  )
  .delete(
    transactionController.deleteTransaction,
    transactionController.getTransactions,
  );

module.exports = router;
