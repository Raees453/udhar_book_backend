const express = require('express');
const {PrismaClient} = require('@prisma/client');

const globalErrorHandler = require('./utils/global_error_handler');

const routes = require('./routes');

const app = express();

app.use(express.json());

app.use(routes);

const prisma = new PrismaClient();

prisma.$connect().then(() => console.log('Connected to Database!')).catch(() => console.log('Could not connect to database'));

app.use(globalErrorHandler);

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server Started at PORT: ${PORT}`);
});
