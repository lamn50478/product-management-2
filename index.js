const express=require('express')
const app=express()
var flash=require('express-flash')

const systemConfig=require('./config/system.js')

const routerAdmin=require('./routers/admin/index.route.js')
const router= require('./routers/client/route_index')
const methodOverride=require("method-override")
const bodyParser= require("body-parser");
const cookieParser=require("cookie-parser");
const expressSession=require("express-session");

const database=require("./config/database");
//env set
require('dotenv').config();
const port=process.env.PORT ||3000;
//end set env

//flash
app.use(cookieParser("12345"));
app.use(expressSession({cookie : {maxAge:60000}}));
app.use(flash());
//end flash

//body-parse
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json());
//end body-parse

//method 
app.use(methodOverride("_method"));
//end method
app.locals.prefixAdmin=systemConfig.prefixAdmin;
database.connect();
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
// app.set("views",`${__dirname}/views`)
app.set("view engine","pug")
// app.use(express.static(`${__dirname}/public`))

//route
router(app)
routerAdmin(app)



// app.listen(port,()=>{
//     console.log(`example listening on ${port}`);
// })
module.exports=app
// 



