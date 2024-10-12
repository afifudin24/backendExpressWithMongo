const { policyFor } = require('../../utils');
const DeliveryAddress = require('./model');

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let user = req.user;
    let address = new DeliveryAddress({ ...payload, user: user._id });
    await address.save();
    return res.json(address);
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

const update = async (req, res, next) => {
  try {
    let { _id, ...payload } = req.body;
    let { id } = req.params;
    let address = await DeliveryAddress.findById(id);
    let subjectAddress = subject('DeliveryAddress', {
      ...address,
      user_id: address.user,
    });
    let policy = policyFor(req.user);
    if (!policy.can('update', subjectAddress)) {
      return res.json({
        error: 1,
        message: 'You are not allowed to modify this resource',
      });
    }
    address = await DeliveryAddress.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return res.json(address);
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

const index = async (req, res, next) => {
  let user = req.user;
  console.log(user);
  try {
    const deliveryAddress = await DeliveryAddress.find({
      user: user._id,
    }).populate({
      path: 'user',
      select: '-password -token -role', // exclude password, token, and role fields
    });

    return res.json({
      data: deliveryAddress,
    });
  } catch (err) {
    console.error('Error in product index:', err);
    next(err);
  }
};

const destroy = async (req, res, next) => {
  try {
    let { id } = req.params;
    let address = await DeliveryAddress.findById(id);
    let subjectAddress = subject('DeliveryAddress', {
      ...address,
      user_id: address.user,
    });
    let policy = policyFor(req.user);
    if (!policy.can('delete', subjectAddress)) {
      return res.json({
        error: 1,
        message: 'You are not allowed to delete this resource',
      });
    }
    await DeliveryAddress.findOneAndDelete({ _id: id, user: req.user._id });
    return res.json({
      message: 'Berhasil menghapus delivery address',
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
module.exports = {
  store,
  update,
  index,
  destroy,
};
