const express = require('express');

const authController = require('../controllers/auth_controller');

const contactsController = require('../controllers/contacts_controller');
const transactionController = require('../controllers/transactions_controller');

const router = express.Router();

router.use(authController.authorise);

router.use(contactsController.checkForLocalContact);

router
  .route('/')
  .get(transactionController.getTransactions)
  .post(transactionController.createTransaction)
  .patch(transactionController.editTransaction)
  .delete(transactionController.deleteTransaction);

module.exports = router;
