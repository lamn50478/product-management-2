// const express=require('express')
// const router=express.Router()
// const controller=require('../../controller/client/product.controller')

  
//     // Các route theo thứ tự: category cụ thể trước
// router.get('/detail/:slugCategory', controller.detailSlug); 
// router.get('/category/:slugCategory', controller.slugCategory);

// // Route danh sách sản phẩm
// router.get('/', controller.product);

// // Route chi tiết sản phẩm theo id (đặt sau các route cụ thể)
// // router.get('/:id', controller.detail);
// module.exports=router;
const express        = require('express');
const router         = express.Router();
const controller     = require('../../controller/client/product.controller');
const streamController = require('../../controller/client/audioStream.controller');

// ── Audio stream (đặt TRƯỚC các route khác)
router.get('/audio/stream/:id', streamController.stream);

// ── Product routes
router.get('/detail/:slugCategory', controller.detailSlug);
router.get('/category/:slugCategory', controller.slugCategory);
router.get('/', controller.product);

module.exports = router;