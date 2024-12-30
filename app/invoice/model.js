const { model, Schema } = require('mongoose');

const invoiceSchema = Schema(
  {
    totals: {
      type: Number,
      default: 0,
    },
    payment_status: {
      type: String,
      enum: ['waiting_payment', 'paid'],
      default: 'waiting_payment',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    uploadPrice: {
      type: String,
      default: 'default',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Invoice', invoiceSchema);
