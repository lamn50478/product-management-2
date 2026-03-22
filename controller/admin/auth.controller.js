const Account=require("../../models/account.model");
const systemConfig=require("../../config/system.js");
const md5=require("md5");
//[GET] /admin/auth/login
module.exports.login=async (req,res)=>{
    const user=await Account.findOne({
        token:req.cookies.token
    });
    if(user){
        res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
    }else{
         res.render('admin/pages/auth/login.pug',{
    pageTitle:"TRANG ĐĂNG NHẬP",
   });
    };
    

}
//[POST] /admin/auth/login

module.exports.loginPost=async (req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const user=await Account.findOne({
        email:email,
        deleted:false
    });
    if(!user){
        req.flash("error","Tài khoản email không tồn tại!");
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return;
    }
    if(md5(password)!=user.password){ 
        req.flash("error","Sai mật khẩu!");
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return;
    }
    if(user.status=="inactive"){ 
        req.flash("error","tài khoản đã bị khóa!");
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return;
    }
    res.cookie("token",user.token);
     res.redirect(`${systemConfig.prefixAdmin}/dashboard`);
}
module.exports.logout=async (req,res)=>{
    res.clearCookie("token");
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
}