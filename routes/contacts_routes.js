const express = require('express');

const authController = require('../controllers/auth_controller');
const contactsController = require('../controllers/contacts_controller');

const router = express.Router();

router.use(authController.authorise);

router.route('/')
  .get(contactsController.getContacts)
  .post(contactsController.addContact)
  .patch(contactsController.updateContact)
  .delete(contactsController.deleteContact);

router.route('/find').get(contactsController.findAccountByPhone);

module.exports = router;
