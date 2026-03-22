const express=require("express");
const router=express.Router();
const accountController=require("../../controller/admin/accounts.controller");
const multer=require("multer");
const upload=multer({}); //const upload=multer({storage:storageMulter()});
const uploadCloud=require("../../middeware/admin/uploadCloud.middeware.js");
const validate=require("../../validates/admin/accounts.validate.js");

router.get("/",accountController.index);
router.get("/create",accountController.create);
router.post("/create",
     upload.single("avatar"),
    uploadCloud.upload,
    validate.createPost,
    accountController.createPost
);
router.get("/edit/:id",accountController.edit);
router.patch("/edit/:id",
    upload.single("avatar"),
    uploadCloud.upload,
    validate.editPatch,
    accountController.editPatch);






module.exports=router