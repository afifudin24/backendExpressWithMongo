const User = require('../user/model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const { secretKey } = require('../../config');
const { getToken } = require('../../utils');
const register = async (req, res, next) => {
  try {
    const payload = req.body;
    let user = new User(payload);
    await user.save();
    return res.json(user);
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

const localStrategy = async (email, password, done) => {
  try {
    let user = await User.findOne({ email }).select(
      '-__v -createdAt -updatedAt -cart_items -token',
    );
    if (!user) return done();
    if (bcrypt.compareSync(password, user.password)) {
      ({ password, ...userWithoutPassword } = user.toJSON());
      return done(null, userWithoutPassword);
    }
  } catch (err) {}
};

const login = (req, res, next) => {
  console.log(req);
  passport.authenticate('local', async function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user)
      return res.json({
        error: 1,
        message: 'Email or password incorrect',
      });
    let signed = jwt.sign(user, secretKey);
    await User.findByIdAndUpdate(user._id, { $push: { token: signed } });
    res.json({
      message: 'Login Successfully',
      user,
      token: signed,
    });
  })(req, res, next);
};

const logout = async (req, res, next) => {
  let token = getToken(req);
  console.log(token);
  let user = await User.findOneAndUpdate(
    { token: { $in: [token] } },
    { $pull: { token: token } },
    { new: true, useFindAndModify: false },
  );

  if (!token || !user) {
    res.json({
      error: 1,
      message: 'No user found',
    });
  }

  return res.json({
    message: 'Logout Berhasil',
  });
};

const me = (req, res, next) => {
  console.log(req);
  console.log('kocak');
  if (!req.user) {
    res.json({
      err: 1,
      message: 'You are not Login or token expired',
    });
  }

  res.json(req.user);
};

module.exports = {
  register,
  login,
  localStrategy,
  logout,
  me,
};
