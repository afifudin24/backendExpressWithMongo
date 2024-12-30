const Product = require('../product/models');
const CartItem = require('../cart-item/model');
const store = async (req, res, next) => {
  console.log('kok');
  try {
    const { productId, qty } = req.body;
    console.log(req.body);
    // Validasi apakah produk ada
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        error: 1,
        message: 'Product not found',
      });
    }

    // Cek apakah item sudah ada di keranjang
    let cartItem = await CartItem.findOne({
      user: req.user._id,
      product: productId,
    });
    let qtyUpdate;
    if (cartItem) {
      // Jika sudah ada, update qty
      cartItem.qty += qty;
      cartItem.price = product.price * cartItem.qty;
      await cartItem.save();
      qtyUpdate = true;
    } else {
      // Jika belum ada, tambahkan sebagai item baru
      cartItem = new CartItem({
        user: req.user._id,
        product: product._id,
        qty,
        price: product.price * qty,
        image_url: product.image_url,
        name: product.name,
      });
      qtyUpdate = false;
      await cartItem.save();
    }

    return res.json({
      error: 0,
      message: 'success add to cart',
      data: cartItem,
      qtyUpdate,
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
const updateCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    console.log(qty);
    // Validasi kuantitas
    if (qty < 0) {
      return res.status(400).json({
        error: 1,
        message: 'Quantity cannot be negative',
      });
    }

    // Cek apakah item ada di keranjang
    let cartItem = await CartItem.findOne({
      user: req.user._id,
      product: productId,
    });

    if (!cartItem) {
      return res.status(404).json({
        error: 1,
        message: 'Item not found in cart',
      });
    }

    // Update kuantitas
    if (qty === 0) {
      // Jika kuantitas 0, hapus item dari keranjang
      await CartItem.deleteOne({ _id: cartItem._id });
      return res.json({
        error: 0,
        message: 'Item removed from cart',
        qty: 0,
      });
    } else {
      // Jika kuantitas lebih dari 0, update kuantitas dan harga
      cartItem.qty = qty;
      // cartItem.price = cartItem.product.price * qty; // Asumsi cartItem memiliki referensi ke product
      await cartItem.save();
    }

    return res.json({
      error: 0,
      message: 'Cart item updated successfully',
      data: cartItem,
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

const deleteCart = async (req, res, next) => {
  const { productId } = req.params;
  try {
    let cartItem = await CartItem.findOne({
      user: req.user._id,
      product: productId,
    });

    if (!cartItem) {
      return res.status(404).json({
        error: 1,
        message: 'Item not found in cart',
      });
    } else {
      await CartItem.deleteOne({ _id: cartItem._id });
      return res.json({
        error: 0,
        message: 'Item removed from cart',
      });
    }
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
    const { items } = req.body;
    const productIds = items.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: productIds } });
    let cartItems = items.map((item) => {
      let relatedProduct = products.find(
        (product) => product._id.toString() === item.product._id,
      );
      return {
        product: relatedProduct._id,
        price: relatedProduct.price,
        image_url: relatedProduct.image_url,
        name: relatedProduct.name,
        user: req.user._id,
        qty: item.qty,
      };
    });
    await CartItem.deleteMany({ user: req.user._id });
    await CartItem.bulkWrite(
      cartItems.map((item) => {
        return {
          updatedOne: {
            filter: {
              user: req.user._id,
              products: item.product,
            },
            update: item,
            upsert: true,
          },
        };
      }),
    );
    return res.json(cartItems);
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

const index = async (req, res, next) => {
  try {
    let items = await CartItem.find({ user: req.user._id }).populate('product');
    let count = items.length;
    return res.json({
      data: items,
      count: count,
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
  update,
  index,
  updateCart,
  store,
  deleteCart,
};
