const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  changePassword,
} = require("../controllers/auth");

router.route("/signUp").post(signUp);
router.route("/signIn").post(signIn);
router.route("/signOut").post(signOut);
router.route("/forgotPassword").post(forgotPassword);
router.route("/changePassword/:token").post(changePassword);

module.exports = router;
