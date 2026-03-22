// const express=require('express')
// const app=express()
// var flash=require('express-flash')
// const path = require('path');


// const systemConfig=require('./config/system.js')

// const routerAdmin=require('./routers/admin/index.route.js')
// const router= require('./routers/client/route_index')
// const methodOverride=require("method-override")
// const bodyParser= require("body-parser");
// const cookieParser=require("cookie-parser");
// const expressSession=require("express-session");

// const database=require("./config/database");
// //env set
// require('dotenv').config();
// const port=process.env.PORT || 3000;
// //end set env

// //flash
// app.use(cookieParser("12345"));
// app.use(expressSession({cookie : {maxAge:60000}}));
// app.use(flash());
// //end flash

// //tiny mce
// app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// //end tiny mce

// //body-parse
// app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.json());
// //end body-parse

// //method 
// app.use(methodOverride("_method"));
// //end method
// app.locals.prefixAdmin=systemConfig.prefixAdmin;
// database.connect();
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'views'));
// // app.set("views",`${__dirname}/views`)
// app.set("view engine","pug")
// // app.use(express.static(`${__dirname}/public`))

// //route
// router(app)
// routerAdmin(app)



// app.listen(port,()=>{
//     console.log(`example listening on ${port}`);
// })
// // module.exports=app
// // 


const express = require('express');
const app = express();
var flash = require('express-flash');
const path = require('path');

const systemConfig = require('./config/system.js');
const routerAdmin = require('./routers/admin/index.route.js');
const router = require('./routers/client/route_index');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');

// env
require('dotenv').config();
const port = process.env.PORT || 3000;

// flash
app.use(cookieParser('12345'));
app.use(expressSession({ cookie: { maxAge: 60000 } }));
app.use(flash());

// tiny mce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// body-parse
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// method override
app.use(methodOverride('_method'));

app.locals.prefixAdmin = systemConfig.prefixAdmin;

// static & view
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// route registration (kept but will be used only after DB connect)
function registerRoutes() {
  router(app);
  routerAdmin(app);
}

// --- MongoDB / Mongoose startup logic ---
const mongoose = require('mongoose');

const MONGO_URI =
  process.env.MONGO_URL ||
  process.env.DATABASE_URL ||
  'mongodb://localhost:27017/yourdb';

// Bỏ useNewUrlParser & useUnifiedTopology (deprecated từ driver v4)
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,  // fail nhanh hơn: 5s thay vì 10s
  socketTimeoutMS: 30000,
  connectTimeoutMS: 5000,
  maxPoolSize: 10,                 // tối đa 10 connections song song
  minPoolSize: 2,                  // giữ sẵn 2 connections, tránh tạo mới mỗi request
  heartbeatFrequencyMS: 5000,      // kiểm tra server mỗi 5s
  family: 4,                       // ưu tiên IPv4, tránh thử IPv6 trước
};

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;

async function startServer() {
  try {
    console.log(`Connecting to MongoDB... (attempt ${retryCount + 1})`);
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('MongoDB connected');
    retryCount = 0; // reset khi kết nối thành công

    // register routes after DB is connected
    registerRoutes();

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    retryCount++;
    console.error(
      `Failed to connect to MongoDB (${retryCount}/${MAX_RETRIES}):`,
      err && err.message ? err.message : err
    );

    if (retryCount >= MAX_RETRIES) {
      console.error('Max retries reached. Exiting.');
      process.exit(1);
    }

    console.log(`Retrying in ${RETRY_DELAY / 1000}s...`);
    setTimeout(startServer, RETRY_DELAY);
  }
}

// Lắng nghe sự kiện sau khi đã connect thành công
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected! Mongoose will attempt to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT received: closing server and mongoose connection');
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing server and mongoose connection');
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(0);
});

// Start
startServer();

// export app for tests if needed
module.exports = app;