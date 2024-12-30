const { getToken, policyFor } = require('../utils');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../app/user/model');
function decodeToken() {
  return async function (req, res, next) {
    try {
      let token = getToken(req);
      console.log('initooken', token);
      console.log(token);
      if (!token) {
        console.log('kosong');
        return next();
      }
      req.user = jwt.verify(token, config.secretKey);

      let user = await User.findOne({ token: { $in: [token] } });
      console.log(user);
      if (!user) {
        res.json({
          error: 1,
          message: 'Token Expired',
        });
      }
    } catch (err) {
      let token = getToken(req);
      if (err && err.name === 'JsonWebTokenError') {
        return res.json({
          error: 1,
          message: err.message,
        });
      } else if (err && err.name === 'TokenExpiredError') {
        let user = await User.findOneAndUpdate(
          { token: { $in: [token] } },
          { $pull: { token: token } },
          { new: true, useFindAndModify: false },
        );
        return res.json({
          error: 1,
          message: err.message,
        });
      }
      next(err);
    }
    return next();
  };
}

// middleware check akses
function police_check(action, subject) {
  return function (req, res, next) {
    let policy = policyFor(req.user);
    console.log(policy);
    if (!policy.can(action, subject)) {
      return res.json({
        error: 1,
        message: `You are not allowed to ${action} ${subject}`,
      });
    }
    next();
  };
}

module.exports = {
  decodeToken,
  police_check,
};
