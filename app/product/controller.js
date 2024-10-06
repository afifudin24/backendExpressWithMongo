const config = require('../../config');
const path = require('path');
const Product = require('./models');
const fs = require('fs');
const store = async (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  console.log(config.rootPath);
  try {
    let payload = req.body;
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
  try {
    const { skip = 0, limit = 10 } = req.query;
    let product = await Product.find()
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    console.log(product);
    return res.json(product);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const update = async (req, res, next) => {
  console.log('kocak');
  try {
    let payload = req.body;
    const { id } = req.params;

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
