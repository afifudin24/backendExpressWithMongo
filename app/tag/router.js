const router = require('express').Router();
const tagController = require('./controller');
const { police_check } = require('../../middlewares');

router.get('/tag', tagController.index);
router.post(
  '/tag',
  // police_check('create', 'Tag'),
  tagController.store,
);
router.put(
  '/tag/:id',
  police_check('update', 'Category'),
  tagController.update,
);
router.delete(
  '/tag/:id',
  police_check('delete', 'Category'),
  tagController.destroy,
);

module.exports = router;
