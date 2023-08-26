const ErrorGlobal = require("../models/errorsGlobal");
const { QueriedResoure } = require("../helper/helper");

exports.deleteOne = (Model, mode = "delete") => {
  return async function (req, res, next) {
    try {
      if (mode === "delete") {
        const doc = await Model.findByIdAndDelete(req.params.id);
      } else {
        const user = await Model.findByIdAndUpdate(req.user.id, {
          active: false,
        });
      }
      return res.status(204).json({
        status: "success",
        message: "Delete doc was success",
      });
    } catch (err) {
      return next(err);
    }
  };
};
exports.updateOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!doc) return next(new ErrorGlobal("Lỗi cập nhật đối tượng", 500));
      return res.status(200).json({ status: "success", data: { doc } });
    } catch (err) {
      next(err);
    }
  };
};
exports.createOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);
      return res.status(201).json({
        status: "success",
        data: {
          doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };
};
exports.getOne = (Model) => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return next(new ErrorGlobal("Không tìm thấy đối tượng", 404));
      return res.status(200).json({
        status: "success",
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  };
};
exports.getMany = (Model) => {
  return async (req, res, next) => {
    try {
      let queryObj = {};
      const totalPages = await Model.countDocuments();
      if (req.query) {
        queryObj = req.query;
      }
      let query = new QueriedResoure(Model.find(), queryObj);
      query.filter().sort().fields().pagination(totalPages);
      const doc = await query.queried.explain();
      return res.status(200).json({
        status: "success",
        docLength: totalPages,
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  };
};
