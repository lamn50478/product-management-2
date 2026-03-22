const express=require("express");
const router=express.Router();
const roleController=require("../../controller/admin/role.controller");

router.get("/",roleController.index);
router.get("/create",roleController.create);
router.post("/create",roleController.createPost);

router.get(`/edit/:id`,roleController.edit)
router.patch(`/edit/:id`,roleController.editPost)

router.get(`/permissions`,roleController.permissions);
router.patch(`/permissions`,roleController.permissionsPatch)


module.exports=router