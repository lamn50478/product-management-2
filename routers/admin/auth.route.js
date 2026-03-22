const express=require('express');
const router=express.Router();
const validateRouter=require("../../validates/admin/auth.validate");
const authController=require("../../controller/admin/auth.controller");




router.get('/login',
    authController.login);
router.post(
    '/login',
    validateRouter.loginPost,
    authController.loginPost);
router.get('/logout',
    authController.logout);

module.exports=router