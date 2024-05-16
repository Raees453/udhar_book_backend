const express = require('express');

const authController = require('../controllers/auth_controller');
const contactsController = require('../controllers/contacts_controller');

const router = express.Router();

router.route('/check-phone').get(contactsController.findAccountByPhone);

router.use(authController.authorise);

router.route('/')
  .get(contactsController.getContacts)
  .post(contactsController.addContact)
  .patch(contactsController.updateContact)
  .delete(contactsController.deleteContact);


module.exports = router;
