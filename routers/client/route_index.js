const ProductRouter=require('./product_route');
const homeRouter=require('./home.router');
const middewareLocals=require("../../middeware/client/middlewareLocal.js");

module.exports=(app)=>{
   app.use(middewareLocals);
   app.use('/',homeRouter);

   app.use('/products',ProductRouter);
};

