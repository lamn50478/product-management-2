const Role=require("../../models/roles.model");
const systemConfig=require("../../config/system.js");
module.exports.index=async (req,res)=>{
    const find={
        deleted:false
    };
    const records=await Role.find(find);
    res.render("admin/pages/role/index.pug",{
        pageTitle:"Nhóm quyền",
        records:records
   })
}
module.exports.create=async (req,res)=>{
    const find={
        deleted:false
    };
    res.render("admin/pages/role/create.pug",{
        pageTitle:"Thêm nhóm quyền",
   })
}

module.exports.createPost=async (req,res)=>{
    console.log(req.body);
    const records=new Role(req.body);
    await records.save();

    res.redirect(`${systemConfig.prefixAdmin}/role`)
}

module.exports.edit=async (req,res)=>{
  try{
        const id=req.params.id;
        const find={
            deleted:false,
            _id:id
        };
        const data=await Role.findOne(find)

        res.render("admin/pages/role/edit.pug",{
            pageTitle:"Chỉnh sửa nhóm quyền",
            data:data
    })
  }
  catch(error){
       res.redirect(`${systemConfig.prefixAdmin}/role`)
  }
}


module.exports.editPost=async (req,res)=>{
    try{
        const id=req.params.id;
        console.log(req.body);

        await Role.updateOne({_id:id},req.body);
        req.flash("success","Cập nhật nhóm quyền thành công")
        res.redirect(`${systemConfig.prefixAdmin}/role`)
    }
    catch(eror){
       res.redirect(`${systemConfig.prefixAdmin}/role`);
       req.flash("error","Cập nhật nhóm quyền thất bại!")
    }
}

//[GET] /admin/roles/permissions 
module.exports.permissions=async (req,res)=>{
     var find={
        deleted:false
     };
     const records=await Role.find(find);
      res.render("admin/pages/role/permissions.pug",{
        pageTitle:"Phân quyền",
        records:records
   })

}

//[Patch] /admin/roles/permissions 
module.exports.permissionsPatch=async (req,res)=>{
   try{
   const Permissions=JSON.parse(req.body.permissions);//chuyen du lieu dang json do fe gui len thanh dang mang de xu ly
   console.log(Permissions);
      for (const item of Permissions){
      await Role.updateOne({_id:item.id},{permission:item.Permission});
    }
    req.flash("success","Cập nhật quyền thành công!");
    res.redirect(`${systemConfig.prefixAdmin}/role/permissions`);
    }
    catch{
         req.flash("error","Cập nhật quyền thất bại");
    }
}