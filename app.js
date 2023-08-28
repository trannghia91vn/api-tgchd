const express = require("express");
const app = express();
const ErrorGlobal = require("./models/ErrorGlobal");

//Test thêm cái pass lỗi cors
const cors = require("cors");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "https://quanlytranggiaocu.vercel.app",
      "https://tranggiaocudayhoc.com/",
    ],
  })
);

//Load enviroment variable, ưu tiên trước
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

//Các gói bảo mật đơn giản trước
// const xssClean = require("xss-clean");
// const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
// app.use(xssClean());
// app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

//Đọc được json từ body
app.use(express.json({ limit: "10kb" }));

//Giới hạn req data từ một user ip
// app.set("trust proxy", true);
const rateLimit = require("express-rate-limit");
const myRateLimiting = rateLimit({
  //Max req trong khoảng thời gian
  max: 100,
  //KHoảng thời gian theo milisecond
  windowMs: 1 * 60 * 60 * 1000,
  //Thông báo lỗi
  message: "Bạn gởi quá nhiều request. Vui lòng thử lại sau 60 phút",
});
app.use(myRateLimiting);
//--------------------------------------

app.use("/", (req, res, next) => {
  console.log("Xin chào đến với api của boss Nghĩa");
  next();
});
//Middleware quản lý route
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orders", ordersRouter);

//Middleware route không tôn tại
app.use("*", (req, res, next) => {
  const error = new ErrorGlobal("Api route không tồn tại", 404);
  next(error);
});

//Middleware lỗi toàn cục đây
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    resDevError(res, err);
  } else {
    resProdError(res, err);
  }
});

module.exports = app;

//Callback phản hồi lỗi tùy môi trường
const resDevError = (res, err) => {
  const message = err.message || "Có gì đó sai rồi bạn ơi.";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message,
    detail: err,
  });
};
const resProdError = (res, err) => {
  const message = err.message || "Có gì đó sai rồi bạn ơi.";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message,
  });
};
