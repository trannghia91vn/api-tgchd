const express = require("express");
const { protect, prepareBeforeProtect } = require("../controllers/auth");
const {
  getOrders,
  getOrder,
  addOrder,
  updateOrder,
  deleteOrder,
  sanitizeBodyDataOrder,
  getDonCho,
} = require("../controllers/orders");

const router = express.Router();

router
  .route("/")
  .get(prepareBeforeProtect, protect, getOrders)
  .post(sanitizeBodyDataOrder, addOrder);

router.use(prepareBeforeProtect, protect);

router.route("/don-cho").get(getDonCho, getOrders);

router.route("/:id").get(getOrder).patch(updateOrder).delete(deleteOrder);

module.exports = router;
