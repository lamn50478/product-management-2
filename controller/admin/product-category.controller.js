const mongoose=require("mongoose");
const productCategory=require('../../models/products-category.model');
const createTreeHelper=require("../../helpers/create-tree.js")

// const filterStatusHelpers=require('../../helpers/fillterStatus');
// const searchHelpers=require('../../helpers/search');
// const paginationHelpers=require('../../helpers/pagination');
const systemConfig=require("../../config/system.js");
const validate=require("../../validates/admin/products.validate.js");

//[GET] admin/product-category/index
module.exports.index= async (req,res)=>{
   const find={
      deleted:false,
    
   }

    
 
  const records = await productCategory.find(find).lean();
const plainRecords = records.map(r => {
  // nếu cần thêm trường index hoặc id string
  r.id = r._id ? String(r._id) : r.id;
  return r;
});
const newRecords = createTreeHelper.tree(plainRecords);
   // console.log(newRecords);
   res.render('admin/pages/products-category/index.pug',{
    pageTitle:"TRANG DANH MỤC SẢN PHẨM",
    records:newRecords
   })
}
//[GET] admin/product-category/create
module.exports.create= async (req,res)=>{
   const find={
      deleted:false
   }
   

   const records=await productCategory.find(find);
   
   
   const newRecords=createTreeHelper.tree(records);
  

   res.render('admin/pages/products-category/create.pug',{
    pageTitle:"THÊM MỚI DANH MỤC",
    records:newRecords
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
//[GET] admin/products-category/edit/id
module.exports.edit= async (req,res)=>{
   try{
const id=req.params.id;

   const find={
      deleted:false
   }
   

   const records=await productCategory.find(find);
   
   
   const newRecords=createTreeHelper.tree(records);

    const data=await productCategory.findOne({
       _id:id,
      deleted:false
    });

   res.render('admin/pages/products-category/edit.pug',{
    pageTitle:"CHỈNH SỬA DANH MỤC",
    data:data,
    records:newRecords
})
   }
   catch{
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
   }
}
//[PATCH] admin/products-category/edit/:id
module.exports.editPost= async (req,res)=>{
    try{
     const id=req.params.id;
     req.body.position=parseInt(req.body.position);
     req.body.stock=parseInt(req.body.stock);
     await productCategory.updateOne({_id:id},req.body);
     res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    catch{
       res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    
}