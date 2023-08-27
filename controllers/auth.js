const UsersModel = require("../models/Users");
const ErrorGlobal = require("../models/ErrorGlobal");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const crypto = require("crypto");
const forgotPasswordMail = require("../helpers/forgotPasswordMail");

const createJwt = (payload) => {
  const token = jsonwebtoken.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

exports.signUp = async (req, res, next) => {
  //1. Tách props cần từ body
  const { username, password } = req.body;
  if (!username || !password) {
    const err = new ErrorGlobal(
      "Thiếu thông tin username hoặc password rồi",
      401
    );
    return next(err);
  }
  try {
    //3. Hashed password
    const hashedPassword = await bcrypt.hash(password, 12);
    //4. Tạo mới user thôi
    const newUserData = { username, password: hashedPassword };
    const newUser = await UsersModel.create(newUserData);
    //6. Tạo token và trả về cookie cho user
    // const token = jsonwebtoken.sign({ username }, process.env.TOKEN_SECRET, {
    //   expiresIn: "3d",
    // });
    const token = createJwt({ username });
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      // secure : true,
      httpOnly: true,
    });
    //cookie.secure chỉ hoạt động trong production khi có tương tác với user
    if (process.env.NODE_ENV === "production") cookie.secure = true;
    //Trả về phản hồi thì hide thằng password đi
    newUser.password = undefined;
    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    return next(err);
  }
};
exports.signIn = async (req, res, next) => {
  //1. check đủ username và password không
  const { username, password } = req.body;
  if (!username || !password)
    return next(new ErrorGlobal("Thiếu thông tin đăng nhập rồi"), 401);
  try {
    //2. tìm xem username này có tôn tại không
    const user = await UsersModel.isUserExist(username, next);
    //3. check password có đúng hay không
    await user.checkPassword(user, password, next);
    //4. tạo jwt và phản hồi về cho users và cookie
    const token = createJwt({ username: user.username });
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });
    if (process.env.NODE_ENV === "production") cookie.secure = true;
    user.password = undefined;
    res.status(200).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.protect = async (req, res, next) => {
  //1. Kiểm tra trong headers có authorization chứa jwt không
  const { authorization } = req.headers;
  if (
    !authorization ||
    !authorization.startsWith("Bearer") ||
    authorization.length < 12
  )
    return next(
      new ErrorGlobal("Token không hợp lệ, vui lòng đăng nhập lại đi", 401)
    );
  const token = authorization.split(" ")[1];
  let username, iat;
  //2. Kiểm tra jwt hợp lệ không
  jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new ErrorGlobal("Xác thực token lỗi gì đó", 500));
    const { username: user, iat: tokenCreateAt } = decoded;
    username = user;
    iat = tokenCreateAt;
  });
  try {
    //3. Kiểm tra user có tồn tại trên db nữa không
    const user = await UsersModel.isUserExist(username, next);
    //4. Kiểm tra thời gian tạo token phải mới hơn thời gian đổi password
    const userChangePasswordAt =
      new Date(user.changePasswordAt).getTime() / 1000;
    if (userChangePasswordAt > iat) {
      return next(
        new ErrorGlobal(
          "Token này không còn phù hơp, vui lòng đăng nhập lại.",
          401
        )
      );
    }
    //Cuối cùng thì gán lại req.user để dùng về sau
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
exports.signOut = async (req, res, next) => {
  //Set cho authorization trong header thành null là được
  res.clearCookie("jwt");
  res.status(200).json({
    status: "success",
    data: {
      token: undefined,
    },
  });
};
exports.forgotPassword = async (req, res, next) => {
  //Do chỉ có một tk admin nên không cần tìm user đồ
  //1. Tạo token và hash token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    //2. Update reset password token lên db
    await UsersModel.findOneAndUpdate(
      { username: "basushi" },
      {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpire: Date.now() + 10 * 60 * 1000,
      }
    );
    //3. Gởi mail resetpassword
    const resetPasswordUrl = process.env.MY_DOMAIN + `/changePassword/${token}`;
    await forgotPasswordMail(resetPasswordUrl);
    res.status(200).json({
      status: "success",
      message: "Gởi mail reset password thành công.",
    });
  } catch (err) {
    next(err);
  }
};
exports.changePassword = async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  //1. Kiểm tra token và đầu vào
  if (!token || !password || !passwordConfirm || password !== passwordConfirm) {
    return next(
      new ErrorGlobal(
        "Thông tin đầu vào đổi password không hợp lệ bồ tèo à",
        401
      )
    );
  }
  //2. Tìm user với resetToken hashed
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const user = await UsersModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpire: { $lt: Date.now() },
    });
    if (!user)
      return next(
        new ErrorGlobal("Bạn không có quyền đổi password của user này", 404)
      );
    //3. Update password mới
    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword;
    user.changePasswordAt = Date.now();
    await user.save();
    res.status(201).json({
      status: "success",
      message: "Đổi password thành công.",
    });
  } catch (err) {
    next(err);
  }
};
