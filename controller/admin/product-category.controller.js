const mongoose=require("mongoose");
const productCategory=require('../../models/products-category.model');
// const filterStatusHelpers=require('../../helpers/fillterStatus');
// const searchHelpers=require('../../helpers/search');
// const paginationHelpers=require('../../helpers/pagination');
const systemConfig=require("../../config/system.js");
const validate=require("../../validates/admin/products.validate.js");

//[GET] admin/product-category
module.exports.index= async (req,res)=>{
   const find={
      deleted:false,
    
   }

   const records=await productCategory.find(find)
   res.render('admin/pages/products-category/index.pug',{
    pageTitle:"TRANG DANh MỤC SẢN PHẨM",
    records:records
   })
}
//[GET] admin/product-category/create
module.exports.create= async (req,res)=>{
   res.render('admin/pages/products-category/create.pug',{
    pageTitle:"THÊM MỚI DANH MỤC",
    
   })
}
//[GET] admin/product-category/createPost

module.exports.createPost= async (req,res)=>{
    
  if(req.body.position == ""){
         var count=await productCategory.countDocuments();
         req.body.position= count + 1;
     }else{
        req.body.position=parseInt( req.body.position);
     }
    const record =new productCategory(req.body);
           await record.save();
          res.redirect(`${systemConfig.prefixAdmin}/products-category`);
}