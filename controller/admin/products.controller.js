//[GET] admin-products
const mongoose=require("mongoose");
const Product=require('../../models/product.model');
const filterStatusHelpers=require('../../helpers/fillterStatus');
const searchHelpers=require('../../helpers/search');
const paginationHelpers=require('../../helpers/pagination');
const systemConfig=require("../../config/system.js");
const validate=require("../../validates/admin/products.validate.js")
//[GET] admin/products
module.exports.products= async (req,res)=>{
//Ham bo loc
const filterStatus=filterStatusHelpers(req.query);
console.log(filterStatus);
//ham bo loc



   const find={
      deleted:false,
    
   }
   let keyword="";
   const objectSearch=searchHelpers(req.query);

   if(objectSearch.regex){
      find.title=objectSearch.regex;
   }

   if(req.query.status){ //req.query.status :lay ra trang thai cua status :active hoac inactive
      find.status=req.query.status
   }
//pagination
   const countProducts=await Product.countDocuments();
   let objectPagination=paginationHelpers(
      {
         currentPage:""|| 1,
         limitPages:"4"
      },
      countProducts,
      req.query
   );
//end pagination 

//sort
let sort={};

if(req.query.sortKey && req.query.sortValue){
    sort[req.query.sortKey]=req.query.sortValue;
}else{
   sort.position="desc";
}

//end sort


   const products=await Product.find(find)
   .sort(sort)
   .limit(objectPagination.limitPages)
   .skip(objectPagination.skip);
   

   res.render('admin/pages/products/products.pug',{
    pageTitle:"TRANG SAN PHAM",
    products:products,
    filterStatus:filterStatus,
    keyword:objectSearch.keyword,
    pagination:objectPagination
   })
}
//[PATCH] /admin/products/change-status/status/id
module.exports.changeStatus=async (req,res)=>{
    const status=req.params.status;
    const id=req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        
        return res.redirect("/admin/products");
}
    await Product.updateOne({_id : id},{status:status});
    req.flash('success',"Cập nhật trạng thái thành công!")
        
      res.redirect(req.get("Referrer") || "/admin/products");

   //  res.send(`${status},${id}`);

   //  res.redirect("back");
};
//[PATCH] /admin/products/change-status/status/id
module.exports.changeMulti=async (req,res)=>{
   const type=req.body.type;
   const ids=req.body.ids.split(", ");
   
   switch (type){
      case "active":
         await Product.updateMany({ _id :{$in : ids}},{status : "active"});
         req.flash("success",`Cập nhật thành công trạng thái của ${ids.length} sản phẩm`);
         break;
      case "inactive":
         await Product.updateMany({ _id :{$in : ids}},{status : "inactive"});
          req.flash("success",`Cập nhật thành công trạng thái của ${ids.length} sản phẩm`);
         break;
      case "delete-all":
         // await Product.deleteMany({_id:{$in:ids}},)
         await Product.updateMany({_id :{$in:ids}},{
            deleted:true,
            deletedDate:new Date()
         })
          req.flash("success",`Xóa thành công  ${ids.length} sản phẩm`);
         break;
      case "change-position":
         for (const item of ids) {
            
            let [id , position]=item.split("-");
            position=parseInt(position);
            console.log(id);
            console.log(position);

         await Product.updateOne({_id:id},{position:position});
         }
          req.flash("success",`Thay đổi vị trí thành công  ${ids.length} sản phẩm`);
      default :
        break;

   }
     res.redirect(req.get("Referer") || "admin/products");
};

//[DELETE] /admin/products/delete-item/id
module.exports.deleteProduct=async (req,res)=>{
   const id=req.params.id;

//   await Product.deleteOne({_id : id});
  await Product.updateOne({_id : id},{
    deleted:true,
    deletedAt:new Date()
   });
    req.flash("success",`Xóa thành công sản phẩm`);

   res.redirect(req.get("Referer") || "admin/products");
};
//[GET] /admin/products/create
module.exports.create= async (req,res)=>{


   res.render('admin/pages/products/create.pug',{
    pageTitle:"Thêm mới sản phẩm",
   
   })
};
//[POST] /admin/products/create
module.exports.createPost= async (req,res)=>{
   req.body.price=parseFloat(req.body.price);
   req.body.discountPercentage=parseFloat( req.body.discountPercentage);
   req.body.stock=parseInt( req.body.stock);
   if(req.body.position == ""){
       var count=await Product.countDocuments();
       req.body.position= count + 1;
   }else{
      req.body.position=parseInt( req.body.position);
   }

    


      const product =new Product(req.body);
      await product.save();
     res.redirect(`${systemConfig.prefixAdmin}/products`);

};
//[GET] /admin/products/edit
module.exports.edit= async (req,res)=>{
try{
      const id=req.params.id;
   const find={
          deleted:false,
          _id:id
   }

    
      const product =await Product.findOne(find);
      res.render('admin/pages/products/edit.pug',{
         pageTitle:"Chỉnh sửa sản phẩm",
         product:product
   
   })
}catch(error){
      req.flash("error","Back to home page")
      res.redirect(req.get("Referer")||"/admin/products")
}
};
//[PATCH] /admin/products/edit/id
module.exports.editPost= async (req,res)=>{
   const id=req.params.id;
   
   req.body.price=parseFloat(req.body.price)|| 0;
   req.body.discountPercentage=parseFloat( req.body.discountPercentage)|| 0;
   req.body.stock=parseInt( req.body.stock)|| 0;
   req.body.position = parseInt(req.body.position) || 0;

 
   // if(req.file){
   //       //  req.body.thumbnail=(`/uploads/${req.file.filename}`);
   // }
   console.log(req.body)
    try {
       await Product.updateOne({_id:id},req.body);
   req.flash("success","Chỉnh sửa thành công");
   res.redirect(`${systemConfig.prefixAdmin}/products`);
    } catch (error) {
        req.flash("error","Chỉnh sửa thất bại");
   res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
   

};
//[GET] /admin/products/detail/:id
module.exports.detail= async (req,res)=>{
try{
      const id=req.params.id;
   const find={
          deleted:false,
          _id:id
   }

    
      const product =await Product.findOne(find);
      res.render('admin/pages/products/detail.pug',{
         pageTitle:product.title,
         product:product
   
   })
}catch(error){
      req.flash("error","Back to home page")
      res.redirect(req.get("Referer")||"/admin/products")
}
};