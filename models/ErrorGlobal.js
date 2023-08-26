class ErrorGlobal extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isMyErrorGlobal = true;
    //Thằng này hỗ trợ truy ra lỗi ở đâu
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorGlobal;
