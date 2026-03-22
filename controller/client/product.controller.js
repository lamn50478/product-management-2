const Product         = require("../../models/product.model");
const ProductCategory = require("../../models/products-category.model");
const productCategoryGetsub = require("../../helpers/product-category-getsub");
const { generateSignedUrl } = require("./audioStream.controller");

// ─────────────────────────────────────────────
// [GET] /products  (có hỗ trợ ?keyword=)
// ─────────────────────────────────────────────
module.exports.product = async (req, res) => {
  try {
    const keyword = (req.query.keyword || '').trim();

    const find = { deleted: false, status: "active" };

    if (keyword) {
      // Ưu tiên $text (tận dụng text index trên title+description+tags)
      // Fallback $or regex để tìm thêm level, language
      find.$or = [
        { title:       { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { level:       { $regex: keyword, $options: 'i' } },
        { language:    { $regex: keyword, $options: 'i' } },
        { tags:        { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    const products = await Product
      .find(find)
      .sort({ position: "desc" });

    const newProducts = products.map(item => {
      item.priceNew = parseFloat(
        (item.price * (100 - item.discountPercentage) / 100).toFixed(0)
      );
      return item;
    });

    res.render("client/pages/product/product.pug", {
      pageTitle: keyword ? `Kết quả: "${keyword}"` : "Trang danh sách podcast",
      products:  newProducts,
      heroBg:    "/uploads/anhpodcast2.png",
      keyword:   keyword
    });
  } catch (error) {
    console.error("product error:", error);
    res.redirect("/");
  }
};

// ─────────────────────────────────────────────
// [GET] /products/category/:slugCategory
// ─────────────────────────────────────────────
module.exports.slugCategory = async (req, res) => {
  try {
    const category = await ProductCategory.findOne({
      slug: req.params.slugCategory,
      deleted: false
    });

    if (!category) {
      req.flash("error", "Danh mục không tồn tại");
      return res.redirect("/products");
    }

    const listSubCategory = await productCategoryGetsub.getSubCategory(category.id);
    const listSubCategoryId = listSubCategory.map(item => item.id);

    const allProducts = await Product.find({
      product_category_id: { $in: [category.id, ...listSubCategoryId] },
      deleted: false,
      status: "active"
    }).sort({ position: "desc" });

    // Tổng hợp levels — normalize về uppercase để hiển thị đồng nhất
    const levelMap = {};
    for (const item of allProducts) {
      if (item.level) {
        const lv = item.level.toUpperCase();
        levelMap[lv] = (levelMap[lv] || 0) + 1;
      }
    }
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const levels = Object.keys(levelMap)
      .sort((a, b) => {
        const ai = levelOrder.indexOf(a);
        const bi = levelOrder.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .map(lv => ({ value: lv, count: levelMap[lv] }));

    // So sánh case-insensitive: ?level=B2 khớp với DB lưu "b2" hoặc "B2"
    const currentLevel = req.query.level ? req.query.level.toUpperCase() : null;
    const filteredProducts = currentLevel
      ? allProducts.filter(item => (item.level || '').toUpperCase() === currentLevel)
      : allProducts;

    const newProducts = filteredProducts.map(item => {
      item.priceNew = parseFloat(
        (item.price * (100 - item.discountPercentage) / 100).toFixed(0)
      );
      item.category_thumbnail = category.thumbnail;
      item.category_title     = category.title;
      return item;
    });

    res.render("client/pages/product/product.pug", {
      pageTitle:    category.title,
      products:     newProducts,
      category:     category,
      heroBg:       "/uploads/anhpodcast2.png",
      levels,
      currentLevel,
      totalCount:   allProducts.length
    });

  } catch (error) {
    console.error("slugCategory error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/products");
  }
};

// ─────────────────────────────────────────────
// [GET] /products/detail/:slugCategory
// ─────────────────────────────────────────────
module.exports.detailSlug = async (req, res) => {
  try {
    const slug = req.params.slugCategory;

    const product = await Product.findOne({
      deleted: false,
      slug: slug,
      status: "active"
    });

    if (!product) {
      req.flash("error", "Không tìm thấy sản phẩm");
      return res.redirect(req.get("Referer") || "/products");
    }

    // Lấy category
    if (product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        deleted: false,
        status: "active"
      });
      product.category = category;
    }

    // Tính giá mới
    product.priceNew = parseFloat(
      (product.price * (100 - product.discountPercentage) / 100).toFixed(0)
    );

    // Tạo signed URL — KHÔNG truyền audioUrl thật ra pug
    const signedAudioUrl = product.audioUrl
      ? generateSignedUrl(product._id.toString(), 7200)
      : null;

    res.render("client/pages/product/detail.pug", {
      pageTitle:      product.title,
      product:        product,
      signedAudioUrl: signedAudioUrl,
      heroBg:         "/uploads/anhpodcast2.png"
    });

  } catch (error) {
    console.error("detailSlug error:", error);
    req.flash("error", "Back to home page");
    res.redirect(req.get("Referer") || "/products");
  }
};