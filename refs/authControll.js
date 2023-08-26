const UsersModel = require("../models/usersModels");
const jwt = require("jsonwebtoken");
const ErrorGlobal = require("../models/errorsGlobal");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../helper/sendMail");

exports.protect = async (req, res, next) => {
  let token;
  //1. Xem trong req có token không nè
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    return next(new Error("Lỗi token, đăng nhập lại đi bạn ơi."), 401);
  }
  token = authorization.split(" ")[1];
  //2. Xác thực token hợp lệ không nè
  jwt.verify(token, process.env.JWT_SECRET, async function (err, decoded) {
    if (err) {
      return next(new Error("Token fake, đăng nhập lại đi bạn ơi."), 401);
    }
    const { id: userId, iat } = decoded;
    //3. Kiểm tra lại xem user còn tồn tại không
    const user = await UsersModel.findById(userId);
    if (!user) {
      return next(new Error("User này không còn fit với token được cấp."), 401);
    }
    //4. Kiểm tra time cấp token phải mới hơn time user đổi password
    if (
      new Date(user.changedPasswordAt).getTime() / 1000 >
      new Date(iat).getTime()
    ) {
      return next(new Error("User mới đổi password. Đăng nhập lại đê."), 401);
    }
    //OK PASS
    req.user = user;
    next();
  });
};
exports.restrictTo = (...role) => {
  return async (req, res, next) => {
    //Kiểm tra xem role của user hiện tại có được phép thao tác không
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorGlobal("Ê chú em không có quyền làm việc này."),
        403
      );
    }
    next();
  };
};
exports.signup = async (req, res, next) => {
  try {
    const newUser = await UsersModel.create(req.body);
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_JWT_EXPIRE * 24 * 60 * 60 * 1000
      ),
      // secure: true,
      httpOnly: true,
    });
    //secure chỉ work trên production khi có giao tiếp với client
    if (process.env.ENV_NAME) res.cookie.secure = true;
    //Trả về thì hide thằng password đi
    newUser.password = undefined;
    res.status(201).json({
      status: "success",
      token,
      data: {
        newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //1. Kiểm tra có email và password không
  if (!email || !password) {
    return next(
      new ErrorGlobal("Đăng nhập mà thiếu email / password rồi má"),
      401
    );
  }
  //2. Kiểm tra xem email có tồn tại không và password có đúng không
  const user = await UsersModel.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorGlobal("Email không tồn tại hoặc password không đúng má ơi"),
      401
    );
  }
  const corectPassword = await user.checkPassword(password, user.password);
  if (!corectPassword) {
    return next(
      new ErrorGlobal("Email không tồn tại hoặc password không đúng má ơi"),
      401
    );
  }
  //3. Pass thì trả về token cho user
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_JWT_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  });
  if (process.env.ENV_NAME) res.cookie.secure = true;

  res.status(200).json({
    status: "success",
    token,
  });
};
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(
      new ErrorGlobal("Nhập email của thím để kiểm tra đổi password đi."),
      401
    );
  }
  // 1. Kiểm tra email đã đăng kí chưa
  const curUser = await UsersModel.findOne({ email });
  if (!curUser) {
    return next(
      new ErrorGlobal("Email này chưa đăng kí tài khoản thím ơi."),
      404
    );
  }
  // 2. Tạo token reset password
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const hashResetPasswordToken = await bcrypt.hash(resetPasswordToken, 12);
  curUser.resetPasswordToken = hashResetPasswordToken;
  curUser.resetPasswordTokenExpired = new Date() + 20 * 60 * 1000;
  await curUser.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${hashResetPasswordToken}`;
  // 3. Gỏi mail token cho client để reset password
  try {
    await sendEmail({ resetPasswordUrl });
    return res.status(200).json({
      status: "success",
      message: "Gởi test email từ node thành công.",
    });
  } catch (err) {
    next(err);
  }
};
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  console.log(token);
  console.log(new Date());
  //1. Tìm user dựa trên token resetPassword
  //2. Kiểm tra xem token hết hạn chưa
  const user = await UsersModel.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpired: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorGlobal("Không tìm thấy user hoặc token fake rồi thím ơi."),
      400
    );
  }

  //3. Update lại password

  //4. Update lại prop changedPasswordAt

  //5. Login user và trả jwt
};
