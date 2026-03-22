// file: middleware/load-layout-data.js
const productCategory = require('../../models/products-category.model');

module.exports = async function loadLayoutData(req, res, next) {
  try {
    const cats = await productCategory.find({ deleted: false, status: 'active' }).lean();
    res.locals.layoutProductsCategory = cats || [];
    res.locals.pathProduct = '/products';
    next();
  } catch (err) {
    // Không dừng app; log và tiếp tục để trang vẫn render (với menu rỗng)
    console.error('loadLayoutData error:', err);
    res.locals.layoutProductsCategory = [];
    res.locals.pathProduct = '/products';
    next();
  }
};
