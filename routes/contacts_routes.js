const express = require('express');

const authController = require('../controllers/auth_controller');
const contactsController = require('../controllers/contacts_controller');

const router = express.Router();

router.use(authController.authorise);

router.use(contactsController.checkForLocalContact);

router
  .route('/')
  .get(contactsController.getAllContacts)
  .post(contactsController.doesContactExist, contactsController.addContact)
  .patch(contactsController.editContact)
  .delete(contactsController.deleteContact);

module.exports = router;
