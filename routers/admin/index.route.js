const dashboardRouter=require('./dashboard.route');
const productRouter=require('./product.route');
const productCategoryRouter=require('./product-category.route');
const accountRouter=require('./accounts.route.js');
const roleRouter=require("./roles.route.js");
const systemConfig=require('../../config/system');
const authMiddleware=require("../../middeware/admin/auth.middleware.js");
const authRouter=require("../../routers/admin/auth.route.js");


module.exports=(app)=>{
    const PATH_ADMIN=systemConfig.prefixAdmin;
    app.use(PATH_ADMIN + "/dashboard" ,authMiddleware.requireAuth,dashboardRouter);
    app.use(PATH_ADMIN + '/products',authMiddleware.requireAuth,productRouter);
    app.use(PATH_ADMIN + '/products-category',authMiddleware.requireAuth,productCategoryRouter);
    app.use(PATH_ADMIN + "/role",authMiddleware.requireAuth,roleRouter),
    app.use(PATH_ADMIN+"/accounts",authMiddleware.requireAuth,accountRouter);
    app.use(PATH_ADMIN+"/auth",authRouter);

}