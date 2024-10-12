const { model, Schema } = require('mongoose');

const deliveryAddressSchema = Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama alamat harus diisi'],
      maxlength: [255, 'Panjang maksimal nama alamat adalah 255 karakter'],
    },

    kelurahan: {
      type: String,
      required: [true, 'Kelurahan harus diisi'],
      maxlength: [255, 'Panjang maksimal kelurahan adalah 255 karakter'],
    },
    kecamatan: {
      type: String,
      required: [true, 'Kecamatan harus diisi'],
      maxlength: [255, 'Panjang maksimal Kecamatan adalah 255 karakter'],
    },
    kabupaten: {
      type: String,
      required: [true, 'Kabupaten harus diisi'],
      maxlength: [255, 'Panjang maksimal Kabupaten adalah 255 karakter'],
    },
    provinsi: {
      type: String,
      required: [true, 'Provinsi harus diisi'],
      maxlength: [255, 'Panjang maksimal Provinsi adalah 255 karakter'],
    },
    detail: {
      type: String,
      required: [true, 'Detail harus diisi'],
      maxlength: [255, 'Panjang maksimal Detail adalah 255 karakter'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = model('DeliveryAddress', deliveryAddressSchema);
