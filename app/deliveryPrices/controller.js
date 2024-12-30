const DeliveryPrices = require('./model');

const index = async (req, res, next) => {
  const kab = req.params.kab;
  console.log(kab);
  try {
    const deliveryPrice = await DeliveryPrices.find({ kabupaten: kab });
    return res.json({
      error: 0,
      message: 'Success Get Data',
      data: deliveryPrice[0],
    });
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const store = async (req, res, next) => {
  console.log(req.body);
  try {
    let payload = req.body;
    let deliveryPrice = new DeliveryPrices(payload);
    await deliveryPrice.save();
    return res.json(deliveryPrice);
  } catch (err) {
    if (err && err.name == 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let payload = req.body;
    let deliveryPrice = await DeliveryPrices.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true,
      },
    );
    return res.json(deliveryPrice);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
  }
};

const destroy = async (req, res, next) => {
  try {
    let deliveryPrice = await DeliveryPrices.findByIdAndDelete(req.params.id);
    return res.json(deliveryPrice);
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

module.exports = {
  index,
  store,
  update,
  destroy,
};
