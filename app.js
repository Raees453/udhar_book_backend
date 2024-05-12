const express = require('express');
const helmet = require('helmet');

const sanitize = require('sanitize');
const morgan = require('morgan');

const { PrismaClient } = require('@prisma/client');

const globalErrorHandler = require('./utils/global_error_handler');
const utils = require('./utils');

const routes = require('./routes');
const Exception = require('./utils/exception');

const app = express();

app.use(morgan('dev'));
app.use(sanitize.middleware);
app.use(helmet());
app.use(express.json({ limit: '50kb' }));

app.use(routes);

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log('Connected to Database!'))
  .catch((error) => {
    console.log('Could not connect to database');
    console.log('ERROR: ', error);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Started at PORT: ${PORT}`);
});

// app.route('*', (req, res, next) => {
//   next(new Exception('Invalid Route Found', 404));
// });

app.use(globalErrorHandler);

process.on('SIGINT', utils.disconnectFromPrismaOnShutdown);
