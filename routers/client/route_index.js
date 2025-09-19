const ProductRouter=require('./product_route');
const homeRouter=require('./home.router');
module.exports=(app)=>{
   app.use('/',homeRouter);

   app.use('/products',ProductRouter);
};

