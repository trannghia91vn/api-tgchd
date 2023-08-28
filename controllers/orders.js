const OrdersModel = require("../models/Orders");
const {
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
} = require("../controllers/handlerFactory");
const sendMailNewOrder = require("../helpers/notiNewOrder");
//Một số alias cho tiện
exports.getDonTheoTrangThai = (status) => {
  return async (req, res, next) => {
    req.query.status = status;
    next();
  };
};

exports.getOrders = async (req, res, next) => {
  await getDocs(req, res, next, OrdersModel);
};
exports.getOrder = async (req, res, next) => {
  await getDoc(req, res, next, OrdersModel);
};

exports.sanitizeBodyDataOrder = async (req, res, next) => {
  console.log(req);
  const {
    time,
    cart,
    name,
    phone,
    address,
    facebookRef,
    shipMethod,
    totalPayment,
  } = req.body;
  req.standardData = {
    time,
    cart,
    name,
    phone,
    address,
    facebookRef,
    shipMethod,
    totalPayment,
  };
  next();
};
exports.addOrder = async (req, res, next) => {
  await addDoc(req, res, next, OrdersModel);
  await sendMailNewOrder({
    time: req.body.time || new Date(),
    totalPayment: req.body.totalPayment || 0,
    name: req.body.name || "Xem lại ai phá rồi.",
  });
};
exports.updateOrder = async (req, res, next) => {
  await updateDoc(req, res, next, OrdersModel);
};
exports.deleteOrder = async (req, res, next) => {
  await deleteDoc(req, res, next, OrdersModel);
};
