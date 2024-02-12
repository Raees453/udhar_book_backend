const express = require('express');
const morgan = require('morgan');

const Exception = require('./utils/exception');

const { PrismaClient } = require('@prisma/client');

// LIST of things to learn
// TODO 1. Learn about Prisma Middlewares
// TODO 2.

// List of TODOs
// TODO Define Debug, Development Configurations if needed
// TODO Research on how to test your NodeJS Project
// TODO Make sure all the authentication APIs are done by 12th Feb Max.

const globalErrorHandler = require('./utils/global_error_handler');

const routes = require('./routes');
const utils = require('./utils');

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use(routes);

app.all('*', (req, res, next) => {
  next(new Exception('No route found', 404));
});

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log('Connected to Database!'))
  .catch(() => console.log('Could not connect to database'));

app.use(globalErrorHandler);

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server Started at PORT: ${PORT}`);
});

process.on('SIGINT', utils.disconnectFromPrismaOnShutdown);
