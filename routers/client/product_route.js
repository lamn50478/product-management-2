const express=require('express')
const router=express.Router()
const controller=require('../../controller/client/product.controller')

    router.get('/',controller.product)
    router.get("/:id",controller.detail);
module.exports=router;