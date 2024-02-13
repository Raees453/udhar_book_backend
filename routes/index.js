const express = require('express');

const router = express.Router();

const authRoutes = require('./auth_routes');

const contactsRoutes = require('./contacts_routes');

const transactionsRoutes = require('./transactions_route');

router.use('/auth', authRoutes);

router.use('/contacts', contactsRoutes);

router.use('/transactions', transactionsRoutes);

module.exports = router;
