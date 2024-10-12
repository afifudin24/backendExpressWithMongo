const router = require('express').Router();
const { police_check } = require('../../middlewares');
const DeliveryAddressController = require('./controller');

router.get(
  '/delivery-addresses',
  police_check('read', 'DeliveryAddress'),
  DeliveryAddressController.index,
);
router.post(
  '/delivery-addresses',
  police_check('create', 'DeliveryAddress'),
  DeliveryAddressController.store,
);

router.put('/delivery-addresses/:id', DeliveryAddressController.update);

router.delete('/delivery-addresses/:id', DeliveryAddressController.destroy);
module.exports = router;
