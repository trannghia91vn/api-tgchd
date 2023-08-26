class ErrorGlobal extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperator = true;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorGlobal;
