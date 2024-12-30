const { model, Schema } = require('mongoose');
const DeliveryPriceSchema = Schema({
  kabupaten: {
    type: String,
    required: [true, 'Kabupaten Harus Diisi'],
  },
  price: {
    type: Number,
    default: 0,
  },
});

module.exports = model('DeliveryPrices', DeliveryPriceSchema);
