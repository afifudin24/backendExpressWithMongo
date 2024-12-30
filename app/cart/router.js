const router = require('express').Router();
const { police_check } = require('../../middlewares');
const cartController = require('./controller');

router.post(
  '/carts',
  // police_check('update', 'Cart'),
  cartController.store,
);
router.put(
  '/carts',
  // police_check('update', 'Cart'),
  cartController.updateCart,
);
router.get('/carts', police_check('read', 'Cart'), cartController.index);
router.delete('/carts/:productId', cartController.deleteCart);
module.exports = router;
