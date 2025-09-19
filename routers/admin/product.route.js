const express=require('express');
const router=express.Router();
const multer=require("multer");
const storageMulter=require("../../helpers/storageMulter");
const upload=multer({storage:storageMulter()});
const productsController=require("../../controller/admin/products.controller");
const validate=require("../../validates/admin/products.validate.js");

router.get('/',productsController.products);
router.patch('/change-status/:status/:id',productsController.changeStatus);

router.patch('/change-multi',productsController.changeMulti);
router.delete('/delete-product/:id',productsController.deleteProduct);
router.get('/create',productsController.create);
router.post(
    '/create',
    upload.single("thumbnail"),
    validate.createPost,
    productsController.createPost);
router.get(
    "/edit/:id",
    upload.single("thumbnail"),
    productsController.edit);

router.patch(
    "/edit/:id",
    upload.single("thumbnail"),
    validate.createPost,
    productsController.editPost);

router.get("/detail/:id",productsController.detail);
module.exports=router