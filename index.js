


// const express = require('express');
// const app = express();
// var flash = require('express-flash');
// const path = require('path');

// const systemConfig = require('./config/system.js');
// const routerAdmin = require('./routers/admin/index.route.js');
// const router = require('./routers/client/route_index');
// const methodOverride = require('method-override');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const expressSession = require('express-session');

// // env
// require('dotenv').config();
// const port = process.env.PORT || 3000;

// // flash
// app.use(cookieParser('12345'));
// app.use(expressSession({ cookie: { maxAge: 60000 } }));
// app.use(flash());

// // tiny mce
// app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

// // body-parse
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());

// // method override
// app.use(methodOverride('_method'));

// app.locals.prefixAdmin = systemConfig.prefixAdmin;

// // static & view
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');

// // route registration (kept but will be used only after DB connect)
// function registerRoutes() {
//   router(app);
//   routerAdmin(app);
// }

// // --- MongoDB / Mongoose startup logic ---
// const mongoose = require('mongoose');

// const MONGO_URI =
//   process.env.MONGO_URL ||
//   process.env.DATABASE_URL ||
//   'mongodb://localhost:27017/yourdb';

// // Bỏ useNewUrlParser & useUnifiedTopology (deprecated từ driver v4)
// const mongooseOptions = {
//   serverSelectionTimeoutMS: 5000,  // fail nhanh hơn: 5s thay vì 10s
//   socketTimeoutMS: 30000,
//   connectTimeoutMS: 5000,
//   maxPoolSize: 10,                 // tối đa 10 connections song song
//   minPoolSize: 2,                  // giữ sẵn 2 connections, tránh tạo mới mỗi request
//   heartbeatFrequencyMS: 5000,      // kiểm tra server mỗi 5s
//   family: 4,                       // ưu tiên IPv4, tránh thử IPv6 trước
// };

// let retryCount = 0;
// const MAX_RETRIES = 5;
// const RETRY_DELAY = 3000;

// async function startServer() {
//   try {
//     console.log(`Connecting to MongoDB... (attempt ${retryCount + 1})`);
//     await mongoose.connect(MONGO_URI, mongooseOptions);
//     console.log('MongoDB connected');
//     retryCount = 0; // reset khi kết nối thành công

//     // register routes after DB is connected
//     registerRoutes();

//     app.listen(port, () => {
//       console.log(`Server listening on port ${port}`);
//     });
//   } catch (err) {
//     retryCount++;
//     console.error(
//       `Failed to connect to MongoDB (${retryCount}/${MAX_RETRIES}):`,
//       err && err.message ? err.message : err
//     );

//     if (retryCount >= MAX_RETRIES) {
//       console.error('Max retries reached. Exiting.');
//       process.exit(1);
//     }

//     console.log(`Retrying in ${RETRY_DELAY / 1000}s...`);
//     setTimeout(startServer, RETRY_DELAY);
//   }
// }

// // Lắng nghe sự kiện sau khi đã connect thành công
// mongoose.connection.on('disconnected', () => {
//   console.warn('MongoDB disconnected! Mongoose will attempt to reconnect...');
// });

// mongoose.connection.on('reconnected', () => {
//   console.log('MongoDB reconnected');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB error:', err.message);
// });

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   console.log('SIGINT received: closing server and mongoose connection');
//   try {
//     await mongoose.disconnect();
//   } catch (e) {
//     // ignore
//   }
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('SIGTERM received: closing server and mongoose connection');
//   try {
//     await mongoose.disconnect();
//   } catch (e) {
//     // ignore
//   }
//   process.exit(0);
// });

// // Start
// startServer();

// // export app for tests if needed
// module.exports = app;
const express    = require('express');
const app        = express();
const path       = require('path');
const flash      = require('express-flash');
const methodOverride = require('method-override');
const bodyParser     = require('body-parser');
const cookieParser   = require('cookie-parser');
const expressSession = require('express-session');
const mongoose       = require('mongoose');

require('dotenv').config();

const systemConfig  = require('./config/system.js');
const routerAdmin   = require('./routers/admin/index.route.js');
const routerClient  = require('./routers/client/route_index');

// ── Middleware ──
app.use(cookieParser('12345'));
app.use(expressSession({ cookie: { maxAge: 60000 } }));
app.use(flash());
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ── View engine ──
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// ── Routes (đăng ký TRƯỚC — Vercel cần export app ngay) ──
routerClient(app);
routerAdmin(app);

// ── MongoDB ──
const MONGO_URI =
  process.env.MONGO_URL      ||
  process.env.DATABASE_URL   ||
  process.env.MONGODB_URI    ||
  'mongodb://localhost:27017/yourdb';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS:          30000,
    maxPoolSize:              10,
    minPoolSize:              2,
    family:                   4,
  });
  isConnected = true;
  console.log('MongoDB connected');
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('MongoDB reconnected');
});
mongoose.connection.on('error', err => console.error('MongoDB error:', err.message));

// ── DB middleware — đảm bảo kết nối trước mỗi request (quan trọng cho cold start) ──
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connect failed:', err.message);
    res.status(503).json({ error: 'Database unavailable. Please try again.' });
  }
});

// ── Local development: start server bình thường ──
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(port, () => console.log(`Server on http://localhost:${port}`));
    })
    .catch(err => {
      console.error('Failed to start:', err.message);
      process.exit(1);
    });
}

// ── Export cho Vercel serverless ──
module.exports = app;