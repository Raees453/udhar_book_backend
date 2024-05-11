class Exception extends Error{

  constructor(message, code) {
    super(message);

    this.code = code;
    this.isOperational = true;

    // what does this line do?
    Error.prepareStackTrace(this, this.constructor);
  }
}


module.exports = Exception;
