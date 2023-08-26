const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const ErrorGlobal = require("./models/errorsGlobal");

const app = express();

//Middleware bảo vệ header
app.use(helmet());

//Middleware xử lý rate limit
const rateLimiting = rateLimit({
  //Thiết lập tối đa số lượng req
  max: 100,
  //Thiết lập khoảng thời gian được dùng max trên
  windowMs: 1 * 60 * 60 * 1000,
  //Thông báo nếu lỗi vượt quá rate limit
  message: "Quá nhiều yêu cầu được gởi bởi ID này, vui lòng thử lại sau 1h.",
});
app.use("/api", rateLimiting);

//Middleware xử lý đọc json của body
app.use(express.json({ limit: "10kb" }));

//Làm sạch noSql injection
app.use(mongoSanitize());

//Làm sạch input user
app.use(xssClean());

//Middleware đọc thông tin đăng nhập
if (process.env.ENV_NAME === "development") {
  console.log("Chạy development !");
  app.use(morgan("dev"));
}
//Middleware cho phép đọc file static
app.use(express.static(`${__dirname}/public`));

const toursRoute = require("./routers/toursRouter");
const usersRoute = require("./routers/usersRouter");
const authRoute = require("./routers/authRouter");
const reviewsRoute = require("./routers/reviewsRouter");
const testMailRoute = require("./routers/testMailRouter")
//Dùng middleware route
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/reviews", reviewsRoute);
app.use("/api/v1/testMail",testMailRoute)

//Middleware cuối xử lý router không tòn tại
app.all("*", (req, res, next) => {
  // const err = new Error(
  //   `This url ${req.originalUrl} is not exist in the server.`
  // );
  // err.status = "fail";
  // err.statusCode = 404;
  // next(err);
  next(
    new ErrorGlobal(`This url ${req.originalUrl} is not exist in the server.`),
    404
  );
});
//Tạo 2 cb gởi res err khi dev/prod
const sendResErrDev = (res, err) => {
  const errStatus = err.status || "error";
  const errStatusCode = err.statusCode || 500;
  return res.status(errStatusCode).json({
    status: errStatus,
    message: err.message,
    stack: err.stack,
    errorDetails: err,
  });
};
const sendResErrProd = (res, err) => {
  const errStatus = err.status || "error";
  const errStatusCode = err.statusCode || 500;
  return res.status(errStatusCode).json({
    status: errStatus,
    message: err.message,
  });
};
//Global middleware xủ lý lỗi
app.use((err, req, res, next) => {
  if (process.env.ENV_NAME === "development") {
    sendResErrDev(res, err);
  } else {
    sendResErrProd(res, err);
  }
});

module.exports = app;
