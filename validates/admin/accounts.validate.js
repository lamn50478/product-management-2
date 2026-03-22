module.exports.createPost=(req,res,next)=>{
       if(!req.body.fullName){
     req.flash("error","Vui lòng nhập tên");
     res.redirect(req.get("Referer") || "admin/accounts");
     return;
    
  }
  if(req.body.fullName.length <= 3){
     req.flash("error","Vui lòng nhập họ tên hơn 3 kí tự");
      res.redirect(req.get("Referer") || "admin/accounts");
      return;
  }
    if(!req.body.password){
     req.flash("error","Vui lòng nhập password");
      res.redirect(req.get("Referer") || "admin/accounts");
      return;
  }
  next();
}

module.exports.editPatch=(req,res,next)=>{
         if(!req.body.fullName){
     req.flash("error","Vui lòng nhập tên");
     res.redirect(req.get("Referer") || "admin/accounts");
     return;
    
  }
  if(req.body.fullName.length <= 3){
     req.flash("error","Vui lòng nhập họ tên hơn 3 kí tự");
      res.redirect(req.get("Referer") || "admin/accounts");
      return;
  }

  next();
}