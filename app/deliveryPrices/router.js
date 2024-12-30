const router = require('express').Router();
const deliveryPriceController = require('./controller');
router.get('/delivery-price/:kab', deliveryPriceController.index);
router.post('/delivery-price/', deliveryPriceController.store);
router.put('/delivery-price/:id', deliveryPriceController.update);
router.delete('/delivery-price/:id', deliveryPriceController.destroy);
module.exports = router;
