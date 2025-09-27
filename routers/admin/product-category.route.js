const express= require('express');
const router=express.Router();
const productCategoryController=require("../../controller/admin/product-category.controller");
const multer=require("multer");
// const storageMulter=require("../../helpers/storageMulter");
const upload=multer({}); //const upload=multer({storage:storageMulter()});
//end multer

const validate=require("../../validates/admin/products-category.validate.js");
const uploadCloud=require("../../middeware/admin/uploadCloud.middeware.js");

router.get("/",productCategoryController.index);
router.get('/create',productCategoryController.create);
router.post(
    '/create',
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    productCategoryController.createPost);



module.exports=router;