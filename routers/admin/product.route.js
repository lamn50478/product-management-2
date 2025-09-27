const express=require('express');
const router=express.Router();
//multer
const multer=require("multer");
// const storageMulter=require("../../helpers/storageMulter");
const upload=multer({}); //const upload=multer({storage:storageMulter()});
//end multer
const productsController=require("../../controller/admin/products.controller");
const validate=require("../../validates/admin/products.validate.js");
const uploadCloud=require("../../middeware/admin/uploadCloud.middeware.js");



router.get('/',productsController.products);
router.patch('/change-status/:status/:id',productsController.changeStatus);

router.patch('/change-multi',productsController.changeMulti);
router.delete('/delete-product/:id',productsController.deleteProduct);
router.get('/create',productsController.create);
router.post(
    '/create',
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    productsController.createPost);
router.get(
    "/edit/:id",
    uploadCloud.upload,
    upload.single("thumbnail"),
    productsController.edit);

router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    productsController.editPost);

router.get("/detail/:id",productsController.detail);
module.exports=router