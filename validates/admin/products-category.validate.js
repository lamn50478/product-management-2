module.exports.createPost=(req,res,next)=>{
       if(!req.body.title){
     req.flash("error","Vui lòng nhập tiêu đề");
     res.redirect(req.get("Referer") || "admin/products");
     return;
    
  }
  if(req.body.title.length <= 3){
     req.flash("error","Vui long nhap tieu de lon hon 3 ki tu");
      res.redirect(req.get("Referer") || "admin/products");
      return;
  }
  next();
}