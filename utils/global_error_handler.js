const Exception = require('./exception');

module.exports = (err, req, res, next) => {
  console.error('Global Error Handler!');

  if (process.env.ENVIRONMENT === 'development') console.error(err);

  err = handleError(err);

  res.status(err.code).json({
    status: false,
    message: err.message,
  });

  next();
};

const handleError = (err) => {
  let code = err.code || 500;
  const message = err.message || 'Something went wrong';

  if (err.code === 'P2002') {
    return handleDuplicateDataError(err);
  } else if (err.code === 'P2025') {
    return handleInvalidForeignKeyValueError(err);
  }

  if (typeof code !== 'number') {
    console.log(`Code not valid:`, code);

    code = 500;
  }

  // TODO need to handle this error really carefully
  return new Exception(message, code);
};

const handleDuplicateDataError = (err) =>
  new Exception(`Property ${err.meta.target[0]} already exists`, 400);

const handleInvalidForeignKeyValueError = (err) =>
  new Exception(`Property ${err.meta.modelName} does not exists`, 400);
