const Product=require("../../models/product.model")

module.exports.product=async (req,res)=>{
     const products= await Product
     .find({deleted:false,status:"active"})
     .sort({position : "desc"})
     const newProducts=products.map(item=>{
          item.priceNew=parseFloat((item.price*(100-item.discountPercentage)/100).toFixed(0));
          return item;
     })
    

     res.render("client/pages/product/product.pug",{
          pageTitle:"Trang danh sach san pham",
          products:newProducts
     })
}
//[GET] /products/:id
module.exports.detail=async (req,res)=>{
try{
      const id=req.params.id;
   const find={
          deleted:false,
          _id:id,
          status:"active"
   }

    
      const product =await Product.findOne(find);
      product.price=parseFloat(product.price).toFixed(2);
      product.discountPercentage=parseFloat(product.discountPercentage).toFixed(2);
      product.newPrice=parseFloat((product.price*(100-product.discountPercentage)/100).toFixed(0));
      res.render('client/pages/product/detail.pug',{
         pageTitle:product.title,
         product:product
   
   })
}catch(error){
      req.flash("error","Back to home page")
      res.redirect(req.get("Referer")||"/products")
}
}