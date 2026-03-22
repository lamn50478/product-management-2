const productCategory = require('../../models/products-category.model');
const Product         = require('../../models/product.model.js');

module.exports.index = async (req, res) => {
  try {
    // Lấy 5 sản phẩm mới nhất theo position desc
    const latestProducts = await Product
      .find({ deleted: false, status: 'active' })
      .sort({ position: 'desc' })
      .limit(5)
      .lean();

    // Tính priceNew cho từng sản phẩm
    const products = latestProducts.map(item => {
      item.priceNew = parseFloat(
        (item.price * (100 - item.discountPercentage) / 100).toFixed(0)
      );
      return item;
    });

    // 3 danh mục nổi bật — lấy từ DB theo slug
    // Nếu chưa có slug thì để mảng rỗng, view tự fallback
    const featuredSlugs = ['economics', 'politics', 'culture'];
    const featuredCategories = await productCategory
      .find({ slug: { $in: featuredSlugs }, deleted: false })
      .lean();

    // Map slug → category để dễ dùng trong pug
    const catMap = {};
    featuredCategories.forEach(c => { catMap[c.slug] = c; });

    res.render('client/pages/home/index', {
      pageTitle: 'English Podcast Hub',
      products,
      catMap
    });
  } catch (err) {
    console.error('home index error:', err);
    res.render('client/pages/home/index', {
      pageTitle: 'English Podcast Hub',
      products: [],
      catMap: {}
    });
  }
};