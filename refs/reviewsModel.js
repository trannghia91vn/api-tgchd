const mongoose = require("mongoose");
const { model, Schema } = mongoose;
const ToursModel = require("../models/toursModels");

const reviewsSchema = new Schema({
  review: {
    type: String,
    required: [true, "Vui lòng nhập nội dung đánh giá tour."],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5,
    //2.3333333 -> 23.33333 -> 23 -> 2.3
    set: (result) => Math.round(result * 10) / 10,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tours",
    required: [true, "Đánh giá này phải nói về một tour nào đó."],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "Users",
    required: [true, "Đánh giá này phải thuộc về một user nào đó."],
  },
});

//Tạo một static func thống kê thông số cho tours
reviewsSchema.statics.caclAverageTour = async function (tourId) {
  try {
    const stats = await this.aggregate([
      //Lọc đối tượng trước theo id tour
      {
        $match: { tour: tourId },
      },
      //Tạo nhóm tính toán thống kê nào
      {
        $group: {
          _id: "$tour",
          numRating: { $sum: 1 },
          aveRating: { $avg: "$rating" },
        },
      },
    ]);
    //Cập nhật lại thông số rating của tour tương ứng
    await ToursModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].aveRating,
    });
  } catch (err) {
    console.log("Lỗi thống kê thông số tour.");
  }
};

//Tạo index cho reviews này
reviewsSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewsSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

//Pre query review để bung tour và user data
reviewsSchema.pre(/^find/, function (next) {
  this.populate({ path: "tour", select: "name" }).populate({
    path: "user",
    select: "name email",
  });
  next();
});
//Sau khi thêm một review thì tính toán thông số tour
reviewsSchema.post("save", async function () {
  //Thằng này trả về obj doc nên dùng this.constructor trỏ về model được
  await this.constructor.caclAverageTour(this.tour);
});

reviewsSchema.post(/^findOneAnd/, async function (doc) {
  console.log(doc);
  if (doc) await doc.constructor.caclAverageTour(doc.tour);
});

const ReviewsModel = model("Reviews", reviewsSchema);

module.exports = ReviewsModel;
