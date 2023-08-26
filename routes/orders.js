const express = require("express");
const { protect } = require("../controllers/auth");
const {
  getOrders,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  sanitizeBodyDataOrder,
} = require("../controllers/orders");

const router = express.Router();

router.route("/").get(protect, getOrders).post(sanitizeBodyDataOrder, addOrder);

router.use(protect);

router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;
