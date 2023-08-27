const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const OrdersSchema = new Schema({
  name: {
    type: String,
    required: [true, "Thiếu tên khách hàng"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Thiếu số điện thoại khách hàng"],
  },
  address: {
    type: String,
    required: [true, "Thiếu địa chỉ khách hàng"],
    trim: true,
  },
  facebookRef: String,
  shipMethod: {
    type: String,
    enum: ["cod", "bank"],
    required: [true, "Thiếu phương thức thanh toán"],
  },
  totalPayment: {
    type: Number,
    required: [true, "Thiếu tổng tiền đơn hàng"],
    min: 10000,
  },
  shipAndFee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["nomoney", "money"],
    default: "nomoney",
  },
  cart: {
    type: Array,
    default: [],
    required: [true, "Thiếu thông tin giỏ hàng rồi."],
  },
  time: Date,
});

OrdersSchema.index({ name: 1, totalPayment: 1 });

const OrdersModel = model("orders", OrdersSchema);
module.exports = OrdersModel;
