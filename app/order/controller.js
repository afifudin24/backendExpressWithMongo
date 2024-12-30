const CartItem = require('../cart-item/model');
const DeliveryAddress = require('../deliveryAddress/model');
const Order = require('../order/model');
const { Types } = require('mongoose');
const Orderitem = require('../order-item/model');
const Invoice = require('../invoice/model');

const store = async (req, res, next) => {
  console.log(req.body);
  try {
    let { delivery_fee, delivery_address, totalAmount } = req.body;

    // Ambil item dari keranjang berdasarkan user
    let items = await CartItem.find({ user: req.user._id }).populate('product');
    if (!items.length) {
      return res.json({
        error: 1,
        message: `You can't create an order because your cart is empty.`,
      });
    }
    // Ambil alamat pengiriman
    let address = await DeliveryAddress.findById(delivery_address);
    // Buat order baru
    let order = new Order({
      _id: new Types.ObjectId(),
      status: 'waiting_payment',
      delivery_fee: parseInt(delivery_fee),
      delivery_address: {
        provinsi: address.provinsi,
        kabupaten: address.kabupaten,
        kecamatan: address.kecamatan,
        kelurahan: address.kelurahan,
        detail: address.detail,
      },
      user: req.user._id,
    });
    // Masukkan item ke dalam order_items
    let orderItems = await Orderitem.insertMany(
      items.map((item) => ({
        name: item.product.name,
        qty: parseInt(item.qty),
        price: parseInt(item.product.price),
        order: order._id,
        product: item.product._id,
      })),
    );
    orderItems.forEach((item) => order.order_items.push(item));
    await order.save();
    // Hapus semua item dari keranjang setelah pesanan dibuat
    await CartItem.deleteMany({ user: req.user._id });
    // Buat invoice baru
    let invoice = new Invoice({
      totals: parseInt(totalAmount),
      payment_status: 'waiting_payment',
      user: req.user._id,
      order: order._id,
    });
    await invoice.save();

    console.log(invoice);

    // Kirim response order dan invoice
    return res.json({ order, invoice });
  } catch (err) {
    console.log(err);
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

const index = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.body;
    let count = await Order.find({ user: req.user._id }).countDocuments();
    let orders = await Order.find({ user: req.user._id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('order_items')
      .sort('-createdAt');
    return res.json({
      data: orders.map((order) => order.toJSON({ virtuals: true })),
    });
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

module.exports = {
  store,
  index,
};
