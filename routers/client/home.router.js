const express=require('express');
const router=express.Router();
const controller=require('../../controller/client/home.controller.js');
const middewareLocals=require("../../middeware/client/middlewareLocal.js");

router.get("/",controller.index);
// router.get("/demo",controller.index2);


module.exports=router;