const express = require("express");
const { protect } = require("../controllers/auth");
const {
  getOrders,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  getDonTheoTrangThai,
} = require("../controllers/orders");

const router = express.Router();

router.route("/client").post(addOrder);

router.route("/").get(protect, getOrders).post(addOrder);

router.use(protect);

router.route("/don-cho").get(getDonTheoTrangThai("nomoney"), getOrders);
router.route("/don-xong").get(getDonTheoTrangThai("money"), getOrders);

router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;
