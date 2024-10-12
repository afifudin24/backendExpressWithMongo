const config = require('../../config');
const path = require('path');
const Product = require('./models');
const Category = require('../category/model');
const Tag = require('../tag/model');
const fs = require('fs');

const store = async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  console.log(config.rootPath);
  try {
    let payload = req.body;

    if (payload.category) {
      let category = await Category.findOne({
        name: {
          $regex: payload.category,
          $options: 'i',
        },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }
    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({
        name: {
          $in: payload.tags,
        },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag.id) };
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split('.')[
        req.file.originalname.split('.').length - 1
      ];
      let filename = req.file.filename + '.' + originalExt;
      let targetPath = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`,
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(targetPath);
      src.pipe(dest);

      src.on('end', async () => {
        try {
          let product = new Product({
            ...payload,
            image_url: filename,
          });
          await product.save();
          return res.json(product);
        } catch (err) {
          console.log(err);
          fs.unlinkSync(targetPath);
          if (err && err.name === 'ValidationError') {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on('error', async () => {
        next(err);
      });
    } else {
      let product = new Product(payload);
      await product.save();
      return res.json(product);
    }
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
  // if (!req.user) {
  //   res.json({
  //     err: 1,
  //     message: 'You are not Login or token expired',
  //   });
  // }
  try {
    const {
      skip = 0,
      limit = 10,
      q = '',
      category = '',
      tags = [],
    } = req.query;

    let criteria = {};

    if (q.length) {
      criteria.name = { $regex: q, $options: 'i' };
    }

    if (category.length) {
      const categoryResult = await Category.findOne({
        name: { $regex: category, $options: 'i' },
      });
      if (categoryResult) {
        criteria.category = categoryResult._id;
      } else {
        return res.json([]);
      }
    }

    if (tags.length) {
      const tagsResult = await Tag.find({ name: { $in: tags } });
      if (tagsResult.length > 0) {
        criteria.tags = { $in: tagsResult.map((tag) => tag._id) };
      } else {
        return res.json([]);
      }
    }

    console.log('Search criteria:', criteria);
    let count = await Product.find().countDocuments();
    const products = await Product.find(criteria)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('category')
      .populate('tags');

    console.log('Found products:', products.length);

    return res.json({
      data: products,
      count,
    });
  } catch (err) {
    console.error('Error in product index:', err);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    let payload = req.body;
    const { id } = req.params;

    if (payload.category) {
      let category = await Category.findOne({
        name: {
          $regex: payload.category,
          $options: 'i',
        },
      });
      if (category) {
        payload = { ...payload, category: category._id };
      } else {
        delete payload.category;
      }
    }
    if (payload.tags && payload.tags.length > 0) {
      let tags = await Tag.find({
        name: {
          $in: payload.tags,
        },
      });
      if (tags.length) {
        payload = { ...payload, tags: tags.map((tag) => tag.id) };
      } else {
        delete payload.tags;
      }
    }

    if (req.file) {
      let tmp_path = req.file.path;
      let originalExt = req.file.originalname.split('.')[
        req.file.originalname.split('.').length - 1
      ];
      let filename = req.file.filename + '.' + originalExt;
      let targetPath = path.resolve(
        config.rootPath,
        `public/images/products/${filename}`,
      );

      const src = fs.createReadStream(tmp_path);
      const dest = fs.createWriteStream(targetPath);
      src.pipe(dest);

      src.on('end', async () => {
        try {
          let product = await Product.findById(id);
          console.log(product);
          let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
          console.log(currentImage);
          console.log(fs.existsSync(currentImage));
          if (fs.existsSync(currentImage)) {
            console.log('kocakkkk');
            fs.unlinkSync(currentImage);
          }
          let updateProduct = await Product.findByIdAndUpdate(id, payload, {
            new: true,
            runValidator: true,
          });
          //   await product.save();
          return res.json(updateProduct);
        } catch (err) {
          console.log(err);
          fs.unlinkSync(targetPath);
          if (err && err.name === 'ValidationError') {
            return res.json({
              error: 1,
              message: err.message,
              fields: err.errors,
            });
          }
          next(err);
        }
      });

      src.on('error', async () => {
        next(err);
      });
    } else {
      let product = await Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidator: true,
      });
      //   await product.save();
      return res.json(product);
    }
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

const destroy = async (req, res, next) => {
  console.log('lah');
  try {
    let product = await Product.findByIdAndDelete(req.params.id);

    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    return res.json(product);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
module.exports = {
  store,
  index,
  update,
  destroy,
};
