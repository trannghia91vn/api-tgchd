const mongoose = require("mongoose");
const ErrorGlobal = require("../models/ErrorGlobal");
const bcrypt = require("bcryptjs");
mongoose
  .connect(process.env.MONGODB_URL, { dbName: "tgcdh" })
  .then(() => {
    console.log("Kết nối đến mongodb thành công");
  })
  .catch((err) => {
    console.log("Lối connect đến mongodb gì đó.");
    console.log(err);
  });

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  changePasswordAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: ["dad", "mom", "son"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
});

//Method check user có tồn tại không
usersSchema.statics.isUserExist = async function (username, next) {
  const user = await this.findOne({ username });
  if (!user) return next(new ErrorGlobal("User không tồn tại.", 404));
  return user;
};
//Method check xem password có đúng không
usersSchema.methods.checkPassword = async function (user, password, next) {
  const correctPassword = await bcrypt.compare(password, user.password);
  if (!correctPassword)
    return next(new ErrorGlobal("Password không đúng.", 401));
};

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = UsersModel;
