const express = require("express");
const {
  getAllTours,
  addNewTour,
  getTourById,
  updateTourById,
  deleteTourById,
  query5Cheapest,
  toursStats,
  monthlyStats,
} = require("../controllers/toursControll");
const { protect, restrictTo } = require("../controllers/authControll");

const reviewsRouter = require("../routers/reviewsRouter");

const router = express.Router();

router.use(protect);

//Kết nối xuống route phụ reviews
router.use("/:id/reviews", reviewsRouter);

router.route("/").get(getAllTours).post(restrictTo("boss", "mod"), addNewTour);

router.use(restrictTo("boss", "mod"));

router
  .route("/:id")
  .get(getTourById)
  .patch(updateTourById)
  .delete(deleteTourById);

//Router xử lý lấy 5 tours rẻ nhát
router.route("/top-5-cheapest").get(query5Cheapest, getAllTours);
//Router thống kê aggreate chỉ số tours
router.route("/tours-stats").get(toursStats);
//Router thống kê các chỉ số tours theo tháng trong năm chỉ định
router.route("/monthly-stats/:year").get(monthlyStats);

module.exports = router;
