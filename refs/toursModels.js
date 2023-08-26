const UsersModel = require("./usersModels");
//Két nối mongoose
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Kết nối đến mongodb thành công từ tours model");
  })
  .catch((err) => {
    console.log(err);
    return;
  });

//Tạo một model mongoose đơn giản nào
const toursSchema = new mongoose.Schema({
  startLocation: {
    description: { type: String },
    type: { type: String },
    coordinates: [{ type: Number }],
    address: { type: String },
  },
  ratingsAverage: {
    type: Number,
    required: [true, "Phải có điểm đánh giá trung bình."],
  },
  ratingsQuantity: {
    type: Number,
    required: [true, "Phải có số lượng đánh giá."],
  },
  images: [String],
  startDates: [Date],
  name: {
    type: String,
    required: [true, "Tour thiếu tên rồi"],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, "Phải có thời lượng của tour."],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "Phải có số lượng tối đa thành viên của nhóm."],
  },
  difficulty: {
    type: String,
    default: "medium",
  },
  guides: [String],
  price: {
    type: Number,
    default: 160,
    required: [true, "Phải có giá tiền của tour"],
  },
  summary: {
    type: String,
    required: [true, "Phải có lời tổng kết cho tour."],
  },
  description: {
    type: String,
    required: [true, "Phải có lời mô tả cho tour."],
  },
  imageCover: {
    type: String,
    required: [true, "Phải có url ảnh bìa cho tour."],
  },
  locations: [
    {
      _id: String,
      description: String,
      type: String,
      coordinates: [Number],
      day: Number,
    },
  ],
  // tourGuides: Array,
  tourGuides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
    },
  ],
});
// //Thêm index tăng hiệu năng query
toursSchema.index({ ratingsAverage: 1, price: -1 });

//Test aggregation middleware
toursSchema.pre("aggregate", function (next) {
  next();
});

//Pre query để polute tourGuides
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tourGuides",
    select: "-__v -changedPasswordAt",
  });
  next();
});

// //Pre save chuyển id tourGuides thành data nhúng luôn
// toursSchema.pre("save", async function (next) {
//   const dataUsers = this.tourGuides.map(
//     async (userId) => await UsersModel.findById(userId)
//   );
//   this.tourGuides = await Promise.all(dataUsers);
//   next();
// });

const ToursModel = mongoose.model("Tours", toursSchema);

module.exports = ToursModel;
