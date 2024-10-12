const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const userSchema = new Schema(
  {
    full_name: {
      type: String,
      minlength: [3, 'Panjang maksimal nama antara 3 - 255 karakter'],
      maxlength: [255, 'Panjang maksimal nama antara 3 - 255 karakter'],
      required: [true, 'Nama harus diisi'],
      trim: true,
    },
    customer_id: {
      type: Number,
    },
    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      maxlength: [255, 'Panjang maksimal email harus 255 karakter'],
    },
    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      maxlength: [255, 'Panjang maksimal email harus 255 karakter'],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'], // Anda bisa menyesuaikan role sesuai kebutuhan
      default: 'user',
    },
    token: [String],
  },
  {
    timestamps: true, // Ini akan menambahkan createdAt dan updatedAt secara otomatis
  },
);

// Menambahkan index untuk pencarian yang lebih efisien
// userSchema.index({ email: 1, customer_id: 1 });

// Anda bisa menambahkan metode atau hook di sini jika diperlukan
// Contoh: userSchema.pre('save', function(next) { ... });

userSchema.path('email').validate(
  function (value) {
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return EMAIL_RE.test(value); // <--- Return a boolean value
  },
  (attr) => `${attr.value} harus merupakan email yang valid`,
);
userSchema.path('email').validate(
  async function (value) {
    try {
      const count = await this.model('User').countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`,
);

// function hash
const HASH_ROUND = 10;
userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

userSchema.plugin(AutoIncrement, { inc_field: 'customer_id' });

module.exports = mongoose.model('User', userSchema);
