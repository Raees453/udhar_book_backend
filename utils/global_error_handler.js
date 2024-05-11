const Exception = require('./exception');

module.exports = (err, req, res, next) => {
  console.error('Global Error Handler!');

  if (process.env.ENVIRONMENT === 'development') console.error(err);

  err = handleError(err);

  // TODO message needs to be worked out here
  return res.status(err.code ?? 500).json({
    status: false,
    message: err.message ?? 'Internal Server Error',
  });
};


const handleError = (err) => {

  if(err.isOperational) return err;

  let error;

  // TODO handle multiple kinds on unknown errors here
  if (err.code === 'P2002') {
    error = handleDuplicateDataError(err);
  } else {
    error = new Exception(`Some Error Occurred`, 500);
  }

  return error;
};


const handleDuplicateDataError = (err) =>
  new Exception(`Property '${err.meta.target[0]}' already exists`, 400);
