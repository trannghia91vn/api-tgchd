exports.addDoc = async (req, res, next, model) => {
  try {
    const doc = await model.create(req.standardData || req.body);
    return res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};

const QueriesResource = require("../helpers/apiFeatures");
exports.getDocs = async (req, res, next, model) => {
  try {
    console.log(req.query);
    const handler = new QueriesResource(model.find(), req.query);
    handler.filter().sort();
    if (Object.keys(req.query).length > 0) {
      if (req.query.fields) handler.fields();
      if (req.query.pagination) handler.pagination();
    }
    const docs = await handler.queried;

    return res.status(200).json({
      status: "success",
      data: {
        docs,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDoc = async (req, res, next, model) => {
  try {
    const doc = await model.findById(req.params.id);
    return res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.updateDoc = async (req, res, next, model) => {
  try {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.deleteDoc = async (req, res, next, model) => {
  try {
    await model.findByIdAndDelete(req.params.id);
    return res.status(204).json({
      status: "success",
      message: "Delete doc was success.",
    });
  } catch (err) {
    next(err);
  }
};
